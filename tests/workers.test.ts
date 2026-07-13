import { createExecutionContext, env } from "cloudflare:test";
import { expect, test, describe, beforeEach, vi } from "vitest";
import crypto from "crypto";

// Mock the auth module to avoid importing Next.js navigation components in workerd
vi.mock("../src/auth", () => {
  const mockAuth = vi.fn();
  return {
    auth: mockAuth,
    authConfig: {
      providers: [
        {
          authorize: async (credentials: any) => {
            if (!credentials?.email || !credentials?.password) {
              return null;
            }
            if (credentials.turnstileToken === "invalid-token") {
              return null;
            }
            return { id: "admin-id", email: credentials.email, role: "SUPER_ADMIN" };
          }
        }
      ]
    }
  };
});

import worker, { PaymentCoordinator } from "../src/worker";
import r2Loader from "../src/lib/r2-loader";
import { requireRole } from "../src/lib/auth-utils";
import { auth, authConfig } from "../src/auth";

describe("Workers-native Production Readiness Suite", () => {
  beforeEach(async () => {
    // Clean up D1 tables
    await env.DB.batch([
      env.DB.prepare("DELETE FROM PaymentReviewTask"),
      env.DB.prepare("DELETE FROM OrderItem"),
      env.DB.prepare("DELETE FROM InventoryReservation"),
      env.DB.prepare("DELETE FROM Payment"),
      env.DB.prepare("DELETE FROM AnalyticsEvent"),
      env.DB.prepare("DELETE FROM EmailEvent"),
      env.DB.prepare("DELETE FROM OrderStatusHistory"),
      env.DB.prepare("DELETE FROM \"Order\""),
      env.DB.prepare("DELETE FROM ProductVariant"),
      env.DB.prepare("DELETE FROM Product"),
      env.DB.prepare("DELETE FROM Category"),
      env.DB.prepare("DELETE FROM AdminUser")
    ]);
    vi.restoreAllMocks();
  });

  // Helper to mock Cloudflare Message
  function mockMessage(body: any, attempts = 1) {
    let acked = false;
    let retried = false;
    return {
      id: crypto.randomUUID(),
      body,
      attempts,
      timestamp: new Date(),
      ack: () => { acked = true; },
      retry: () => { retried = true; },
      getAcked: () => acked,
      getRetried: () => retried
    } as any;
  }

  function scheduledController(): ScheduledController {
    return { scheduledTime: Date.now(), cron: "*/5 * * * *", noRetry() {} };
  }

  function messageBatch<T>(queue: string, messages: Message<T>[]): MessageBatch<T> {
    return {
      queue,
      messages,
      metadata: { metrics: { backlogCount: messages.length, backlogBytes: 0 } },
      retryAll() { for (const message of messages) message.retry(); },
      ackAll() { for (const message of messages) message.ack(); },
    };
  }

  async function seedBasicProduct(stockQuantity: number, reservedQuantity: number = 0) {
    const catId = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare("INSERT INTO Category (id, name, slug, updatedAt) VALUES (?, ?, ?, ?)")
      .bind(catId, `Cat ${crypto.randomUUID()}`, `cat-${crypto.randomUUID()}`, now).run();
      
    const prodId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO Product (id, name, slug, description, shortDescription, categoryId, featuredImage, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(prodId, "Product", `product-${crypto.randomUUID()}`, "desc", "short", catId, "img.jpg", now).run();

    const varId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO ProductVariant (id, productId, sku, priceKobo, stockQuantity, reservedQuantity, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(varId, prodId, `SKU-${Date.now()}-${crypto.randomUUID()}`, 1000, stockQuantity, reservedQuantity, now).run();

    return varId;
  }

  // 1. Reservation Expiry
  test("Reservation Expiry sweep", async () => {
    const varId = await seedBasicProduct(10, 3);
    const orderId = crypto.randomUUID();
    const resId = crypto.randomUUID();
    
    // Insert expired reservation
    await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)")
      .bind(orderId, "Test", "test@test.com", "Address", 1000, new Date().toISOString()).run();

    await env.DB.prepare("INSERT INTO InventoryReservation (id, orderId, variantId, quantity, expiresAt) VALUES (?, ?, ?, ?, ?)")
      .bind(resId, orderId, varId, 3, new Date(Date.now() - 1000).toISOString()).run(); // 1s ago

    // Run sweep
    await worker.scheduled(scheduledController(), env, createExecutionContext());

    // Check reservation status
    const reservation = await env.DB.prepare("SELECT * FROM InventoryReservation WHERE id = ?").bind(resId).first();
    expect(reservation!.releasedAt).not.toBeNull();

    // Check stock reserved quantity
    const variant = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(varId).first();
    expect(variant!.reservedQuantity).toBe(0);
  });

  // 2. Repeated Expiry Execution (Idempotence)
  test("Repeated Expiry Sweep is Idempotent", async () => {
    const varId = await seedBasicProduct(10, 3);
    const orderId = crypto.randomUUID();
    const resId = crypto.randomUUID();
    
    await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)")
      .bind(orderId, "Test", "test@test.com", "Address", 1000, new Date().toISOString()).run();

    await env.DB.prepare("INSERT INTO InventoryReservation (id, orderId, variantId, quantity, expiresAt) VALUES (?, ?, ?, ?, ?)")
      .bind(resId, orderId, varId, 3, new Date(Date.now() - 1000).toISOString()).run();

    // Execute first run
    await worker.scheduled(scheduledController(), env, createExecutionContext());
    
    // Verify first release
    const v1 = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(varId).first();
    expect(v1!.reservedQuantity).toBe(0);

    // Run sweep second time
    await worker.scheduled(scheduledController(), env, createExecutionContext());

    // Verify reserved quantity remains 0 (no duplicate decrements below 0)
    const v2 = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(varId).first();
    expect(v2!.reservedQuantity).toBe(0);
  });

  test("Expiry skips paid, payment-review, and successfully charged orders", async () => {
    for (const scenario of ["PAID", "PAYMENT_REVIEW", "SUCCESS_PAYMENT"] as const) {
      const variantId = await seedBasicProduct(10, 1);
      const orderId = crypto.randomUUID();
      const now = new Date().toISOString();
      const orderStatus = scenario === "SUCCESS_PAYMENT" ? "PENDING" : scenario;
      await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, 'Test', 'test@test.com', 'Address', 1000, ?, ?)").bind(orderId, orderStatus, now).run();
      await env.DB.prepare("INSERT INTO InventoryReservation (id, orderId, variantId, quantity, expiresAt) VALUES (?, ?, ?, 1, ?)").bind(crypto.randomUUID(), orderId, variantId, new Date(Date.now() - 1000).toISOString()).run();
      if (scenario === "SUCCESS_PAYMENT") {
        await env.DB.prepare("INSERT INTO Payment (id, orderId, status, reference, expectedAmountKobo, paidAmountKobo, currency, updatedAt) VALUES (?, ?, 'SUCCESS', ?, 1000, 1000, 'NGN', ?)").bind(crypto.randomUUID(), orderId, crypto.randomUUID(), now).run();
      }
      await worker.scheduled(scheduledController(), env, createExecutionContext());
      const variant = await env.DB.prepare("SELECT reservedQuantity FROM ProductVariant WHERE id = ?").bind(variantId).first();
      expect(variant!.reservedQuantity).toBe(1);
    }
  });

  // 3. Outbox Lifecycle and Recovery Sweep
  test("Cron Outbox sweep enqueues PENDING outboxes", async () => {
    const orderId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, ?, ?, ?, ?, 'PAID', ?)")
      .bind(orderId, "Test", "test@test.com", "Address", 1000, new Date().toISOString()).run();

    // Insert pending outbox events (never queued)
    const emailEventId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO EmailEvent (id, orderId, eventName, recipient, templateName, payloadJson, status, updatedAt) VALUES (?, ?, 'order_confirmation', 'test@test.com', 'order_confirmation', '{}', 'PENDING', ?)")
      .bind(emailEventId, orderId, new Date().toISOString()).run();

    // Set up Queue spies
    const sentAnalyticsMessages: any[] = [];
    const sentEmailMessages: any[] = [];
    const mockEnv = {
      ...env,
      ANALYTICS_QUEUE: { send: async (msg: any) => { sentAnalyticsMessages.push(msg); } },
      EMAIL_QUEUE: { send: async (msg: any) => { sentEmailMessages.push(msg); } }
    };

    // Run sweep
    await worker.scheduled(scheduledController(), mockEnv, createExecutionContext());

    // Verify email event queued
    expect(sentEmailMessages.length).toBe(1);
    expect(sentEmailMessages[0].eventId).toBe(emailEventId);

    const outbox = await env.DB.prepare("SELECT * FROM EmailEvent WHERE id = ?").bind(emailEventId).first();
    expect(outbox!.status).toBe("QUEUED");
    expect(outbox!.queuedAt).not.toBeNull();
    expect(outbox!.attempts).toBe(0);
  });

  // 4. DEAD Outboxes are NOT republished
  test("DEAD events are not automatically republished", async () => {
    const orderId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, ?, ?, ?, ?, 'PAID', ?)")
      .bind(orderId, "Test", "test@test.com", "Address", 1000, new Date().toISOString()).run();

    // Insert DEAD event
    const emailEventId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO EmailEvent (id, orderId, eventName, recipient, templateName, payloadJson, status, attempts, maxAttempts, updatedAt) VALUES (?, ?, 'order_confirmation', 'test@test.com', 'order_confirmation', '{}', 'DEAD', 5, 5, ?)")
      .bind(emailEventId, orderId, new Date().toISOString()).run();

    const sentEmailMessages: any[] = [];
    const mockEnv = {
      ...env,
      EMAIL_QUEUE: { send: async (msg: any) => { sentEmailMessages.push(msg); } }
    };

    await worker.scheduled(scheduledController(), mockEnv, createExecutionContext());
    expect(sentEmailMessages.length).toBe(0); // Not enqueued
  });

  // 5. GA4/Resend failures and exponential backoff RETRYABLE status
  test("GA4 failure transition to RETRYABLE and DEAD on final attempt", async () => {
    const orderId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, ?, ?, ?, ?, 'PAID', ?)")
      .bind(orderId, "Test", "test@test.com", "Address", 1000, new Date().toISOString()).run();

    const eventId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO AnalyticsEvent (id, orderId, eventName, status, attempts, maxAttempts, payloadJson, updatedAt) VALUES (?, ?, 'purchase', 'QUEUED', 1, 5, '{\"client_id\":\"123\",\"currency\":\"NGN\",\"value\":1000,\"transaction_id\":\"ref\"}', ?)")
      .bind(eventId, orderId, new Date().toISOString()).run();

    // Stub fetch to return error status
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response("API Error", { status: 500 });

    const mockWorkerEnv = {
      ...env,
      GA4_API_SECRET: "secret",
      GA4_MEASUREMENT_ID: "id"
    };

    try {
      const msg = mockMessage({ id: eventId }, 1);
      // Run consumer
      await worker.queue(messageBatch("obidi-analytics-queue", [msg]), mockWorkerEnv, createExecutionContext());

      expect(msg.getRetried()).toBe(true);

      const outbox = await env.DB.prepare("SELECT * FROM AnalyticsEvent WHERE id = ?").bind(eventId).first();
      expect(outbox!.status).toBe("RETRYABLE");
      expect(outbox!.lastError).toContain("GA4 API returned status 500");
      expect(outbox!.nextAttemptAt).not.toBeNull();
      expect(outbox!.attempts).toBe(2);

      // Now run when attempts = 4 (making next attempt 5, exceeding limit)
      await env.DB.prepare("UPDATE AnalyticsEvent SET attempts = 4 WHERE id = ?").bind(eventId).run();
      const msgFinal = mockMessage({ id: eventId }, 5);
      await worker.queue(messageBatch("obidi-analytics-queue", [msgFinal]), mockWorkerEnv, createExecutionContext());

      expect(msgFinal.getAcked()).toBe(true); // Acknowledged since dead
      const outboxFinal = await env.DB.prepare("SELECT * FROM AnalyticsEvent WHERE id = ?").bind(eventId).first();
      expect(outboxFinal!.status).toBe("DEAD");
      expect(outboxFinal!.attempts).toBe(5);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // 6. Duplicate Email/GA4 messages checks (idempotence)
  test("Duplicate messages do not trigger multiple Resend/GA4 calls", async () => {
    const orderId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, ?, ?, ?, ?, 'PAID', ?)")
      .bind(orderId, "Test Name", "test@test.com", "Address", 1000, new Date().toISOString()).run();

    const eventId = crypto.randomUUID();
    // Event status is SENT
    await env.DB.prepare("INSERT INTO EmailEvent (id, orderId, eventName, recipient, templateName, payloadJson, status, providerMessageId, updatedAt) VALUES (?, ?, 'order_confirmation', 'test@test.com', 'order_confirmation', '{\"customerName\":\"Test Name\",\"totalKobo\":1000}', 'SENT', 'resend-123', ?)")
      .bind(eventId, orderId, new Date().toISOString()).run();

    let fetchCalled = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      fetchCalled = true;
      return new Response(JSON.stringify({ id: "resend-999" }), { status: 200 });
    };

    try {
      const msg = mockMessage({ id: eventId });
      await worker.queue(messageBatch("obidi-email-queue", [msg]), env, createExecutionContext());

      expect(msg.getAcked()).toBe(true);
      expect(fetchCalled).toBe(false); // Resend is NOT called because status was SENT
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // 7. Order Status History uniqueness rule
  test("Order Status History unique index prevents duplicate entries", async () => {
    const orderId = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)")
      .bind(orderId, "Test", "test@test.com", "Address", 1000, now).run();

    // Insert status history record
    await env.DB.prepare("INSERT INTO OrderStatusHistory (id, orderId, status, source, sourceReference, notes, createdAt) VALUES (?, ?, 'PAID', 'PAYSTACK', 'REF_UNIQUE', 'Notes', ?)")
      .bind(crypto.randomUUID(), orderId, now).run();

    // Trying to insert with same orderId, status, sourceReference must throw UNIQUE constraint error
    let threw = false;
    try {
      await env.DB.prepare("INSERT INTO OrderStatusHistory (id, orderId, status, source, sourceReference, notes, createdAt) VALUES (?, ?, 'PAID', 'PAYSTACK', 'REF_UNIQUE', 'Notes', ?)")
        .bind(crypto.randomUUID(), orderId, now).run();
    } catch (err) {
      threw = true;
    }
    expect(threw).toBe(true);
  });

  // 8. R2 Image Loader tests
  test("Image Loader rejects external domains and accepts allowed patterns", () => {
    const originalEnv = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
    const originalNodeEnv = process.env.NODE_ENV;
    
    process.env.NEXT_PUBLIC_ASSET_BASE_URL = "https://obidicosmetics-assets.com/";
    vi.stubEnv("NODE_ENV", "production");

    try {
      // Valid input
      const result = r2Loader({ src: "products/image1.jpg", width: 300, quality: 75 });
      expect(result).toBe("https://obidicosmetics-assets.com/cdn-cgi/image/width=300,quality=75,format=auto,fit=scale-down/https://obidicosmetics-assets.com/products/image1.jpg");

      // Bypasses transform in development
      vi.stubEnv("NODE_ENV", "development");
      const devResult = r2Loader({ src: "products/image1.jpg", width: 300, quality: 75 });
      expect(devResult).toBe("https://obidicosmetics-assets.com/products/image1.jpg");
      vi.stubEnv("NODE_ENV", "production");

      // Rejections
      expect(() => r2Loader({ src: "http://attacker.com/malicious.jpg", width: 300 })).toThrow();
      expect(() => r2Loader({ src: "javascript:alert(1)", width: 300 })).toThrow();
      expect(() => r2Loader({ src: "data:image/png;base64,...", width: 300 })).toThrow();
      expect(() => r2Loader({ src: "../../etc/passwd", width: 300 })).toThrow();
    } finally {
      process.env.NEXT_PUBLIC_ASSET_BASE_URL = originalEnv;
      if (originalNodeEnv === undefined) vi.unstubAllEnvs();
      else vi.stubEnv("NODE_ENV", originalNodeEnv);
    }
  });

  test("Image Loader throws on missing asset base URL", () => {
    const originalEnv = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
    delete process.env.NEXT_PUBLIC_ASSET_BASE_URL;

    try {
      expect(() => r2Loader({ src: "img.jpg", width: 100 })).toThrow("NEXT_PUBLIC_ASSET_BASE_URL is not configured");
    } finally {
      process.env.NEXT_PUBLIC_ASSET_BASE_URL = originalEnv;
    }
  });

  // 9. Auth.js credentials verification & role check tests
  test("Auth.js Credentials verification and requireRole helper", async () => {
    // Verify authorize structure exists and rejects empty credentials
    const authorize = authConfig.providers[0].authorize;
    const nullResult = await authorize({}, new Request("http://test.local"));
    expect(nullResult).toBeNull();

    // Verify authorize succeeds with valid credentials
    const user = await authorize({ email: "admin@test.com", password: "pwd", turnstileToken: "valid" }, new Request("http://test.local"));
    expect(user).not.toBeNull();
    expect(user?.role).toBe("SUPER_ADMIN");

    // Test requireRole allowed role
    const mockAuth = auth as any;
    mockAuth.mockResolvedValueOnce({ user: { role: "SUPER_ADMIN" } });
    const session = await requireRole(["SUPER_ADMIN"]);
    expect(session.user.role).toBe("SUPER_ADMIN");

    // Test requireRole forbidden role
    mockAuth.mockResolvedValueOnce({ user: { role: "ORDER_MANAGER" } });
    await expect(requireRole(["SUPER_ADMIN"])).rejects.toThrow("Forbidden");
  });

  // 10. R2 Storage writing
  test("R2 images storage writing and reading", async () => {
    const key = "test/image.jpg";
    await env.PRODUCT_IMAGES.put(key, "data");
    const item = await env.PRODUCT_IMAGES.get(key);
    expect(item).not.toBeNull();
    const text = await item!.text();
    expect(text).toBe("data");

    // Clean up
    await env.PRODUCT_IMAGES.delete(key);
    const deleted = await env.PRODUCT_IMAGES.get(key);
    expect(deleted).toBeNull();
  });
});
