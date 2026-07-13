import { env } from "cloudflare:test";
import { expect, test, describe, beforeEach } from "vitest";
import crypto from "crypto";

describe("Inventory Triggers & Durable Object", () => {
  beforeEach(async () => {
    // Clean up tables using batch to prevent any asynchronous race conditions
    await env.DB.batch([
      env.DB.prepare("DELETE FROM PaymentReviewTask"),
      env.DB.prepare("DELETE FROM OrderItem"),
      env.DB.prepare("DELETE FROM InventoryReservation"),
      env.DB.prepare("DELETE FROM Payment"),
      env.DB.prepare("DELETE FROM AnalyticsEvent"),
      env.DB.prepare("DELETE FROM \"Order\""),
      env.DB.prepare("DELETE FROM ProductVariant"),
      env.DB.prepare("DELETE FROM Product"),
      env.DB.prepare("DELETE FROM Category")
    ]);
  });

  async function seedBasicProduct(stockQuantity: number, reservedQuantity: number = 0) {
    const catId = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare("INSERT INTO Category (id, name, slug, updatedAt) VALUES (?, ?, ?, ?)")
      .bind(catId, `Test Cat ${crypto.randomUUID()}`, `test-cat-${crypto.randomUUID()}`, now).run();
      
    const prodId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO Product (id, name, slug, description, shortDescription, categoryId, featuredImage, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(prodId, "Test Product", `test-product-${crypto.randomUUID()}`, "desc", "short", catId, "img.jpg", now).run();

    const varId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO ProductVariant (id, productId, sku, priceKobo, stockQuantity, reservedQuantity, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(varId, prodId, `SKU-${Date.now()}-${crypto.randomUUID()}`, 1000, stockQuantity, reservedQuantity, now).run();

    return varId;
  }

  async function createOrder(variantId: string, quantity: number, reference: string, amountKobo: number) {
    const orderId = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(orderId, "Test", "test@test.com", "123 Test St", amountKobo, "PENDING", now).run();

    const itemId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO OrderItem (id, orderId, variantId, quantity, priceKobo) VALUES (?, ?, ?, ?, ?)")
      .bind(itemId, orderId, variantId, quantity, amountKobo).run();

    const resId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO InventoryReservation (id, orderId, variantId, quantity, expiresAt) VALUES (?, ?, ?, ?, ?)")
      .bind(resId, orderId, variantId, quantity, new Date(Date.now() + 3600000).toISOString()).run();

    const payId = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO Payment (id, orderId, provider, status, reference, expectedAmountKobo, currency, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(payId, orderId, "PAYSTACK", "PENDING", reference, amountKobo, "NGN", now).run();

    return { orderId, resId, payId };
  }

  async function callDO(reference: string, providerTransactionId: number, amountKobo: number) {
    const id = env.PAYMENT_COORDINATOR.idFromName(reference);
    const stub = env.PAYMENT_COORDINATOR.get(id);
    const req = new Request("http://do/finalize", {
      method: "POST",
      body: JSON.stringify({
        reference,
        providerTransactionId: providerTransactionId.toString(),
        amountKobo,
        currency: "NGN",
        channel: "card",
        paidAt: new Date().toISOString()
      })
    });
    return stub.fetch(req);
  }

  test("Successful decrement", async () => {
    const varId = await seedBasicProduct(5, 2);
    const ref = "TEST_REF_SUCCESS";
    await createOrder(varId, 2, ref, 2000);

    const response = await callDO(ref, 1001, 2000);
    expect(response.status).toBe(200);

    const data = await response.json() as any;
    expect(data.success).toBe(true);

    // Verify stock
    const variant = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(varId).first();
    expect(variant!.stockQuantity).toBe(3); // 5 - 2
    expect(variant!.reservedQuantity).toBe(0); // 2 - 2

    // Verify order paid
    const order = await env.DB.prepare("SELECT * FROM \"Order\" WHERE id = ?").bind(data.orderId).first();
    expect(order!.status).toBe("PAID");
  });

  test("Exact final unit", async () => {
    const varId = await seedBasicProduct(1, 1);
    const ref = "TEST_REF_EXACT";
    await createOrder(varId, 1, ref, 1000);

    const response = await callDO(ref, 1002, 1000);
    expect(response.status).toBe(200);

    const variant = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(varId).first();
    expect(variant!.stockQuantity).toBe(0); 
  });

  test("Insufficient stock (trigger test)", async () => {
    const varId = await seedBasicProduct(1, 2);
    const ref = "TEST_REF_FAIL";
    const { orderId } = await createOrder(varId, 2, ref, 2000);

    const response = await callDO(ref, 1003, 2000);
    expect(response.status).toBe(200);

    const variant = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(varId).first();
    expect(variant!.stockQuantity).toBe(1); 
    
    const order = await env.DB.prepare("SELECT * FROM \"Order\" WHERE id = ?").bind(orderId).first();
    expect(order!.status).toBe("PAYMENT_REVIEW");
    const payment = await env.DB.prepare("SELECT status FROM Payment WHERE orderId = ?").bind(orderId).first();
    expect(payment!.status).toBe("SUCCESS");
    const normalEmail = await env.DB.prepare("SELECT id FROM EmailEvent WHERE orderId = ?").bind(orderId).first();
    expect(normalEmail).toBeNull();
  });

  test("Multi-item rollback", async () => {
    // 2 variants, one has enough, one does not
    const var1 = await seedBasicProduct(5, 1);
    const var2 = await seedBasicProduct(1, 2);
    const ref = "TEST_REF_MULTI";
    
    const orderId = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare("INSERT INTO \"Order\" (id, customerName, customerEmail, shippingAddress, totalKobo, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(orderId, "Test", "test@test.com", "123 Test St", 3000, "PENDING", now).run();

    await env.DB.prepare("INSERT INTO OrderItem (id, orderId, variantId, quantity, priceKobo) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), orderId, var1, 1, 1000).run();
    await env.DB.prepare("INSERT INTO OrderItem (id, orderId, variantId, quantity, priceKobo) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), orderId, var2, 2, 2000).run(); // Fails here

    await env.DB.prepare("INSERT INTO InventoryReservation (id, orderId, variantId, quantity, expiresAt) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), orderId, var1, 1, new Date(Date.now() + 3600000).toISOString()).run();
    await env.DB.prepare("INSERT INTO InventoryReservation (id, orderId, variantId, quantity, expiresAt) VALUES (?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), orderId, var2, 2, new Date(Date.now() + 3600000).toISOString()).run();

    await env.DB.prepare("INSERT INTO Payment (id, orderId, provider, status, reference, expectedAmountKobo, currency, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), orderId, "PAYSTACK", "PENDING", ref, 3000, "NGN", now).run();

    const response = await callDO(ref, 1004, 3000);
    expect(response.status).toBe(200);

    const v1 = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(var1).first();
    const v2 = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(var2).first();
    
    expect(v1!.stockQuantity).toBe(5);
    expect(v2!.stockQuantity).toBe(1);
    
    const order = await env.DB.prepare("SELECT * FROM \"Order\" WHERE id = ?").bind(orderId).first();
    expect(order!.status).toBe("PAYMENT_REVIEW");
  });

  test("Competing orders", async () => {
    // 2 orders attempt to buy the final unit
    const varId = await seedBasicProduct(1, 2);
    
    const ref1 = "TEST_REF_C1";
    const ref2 = "TEST_REF_C2";
    await createOrder(varId, 1, ref1, 1000);
    await createOrder(varId, 1, ref2, 1000);

    // Call concurrently
    const [res1, res2] = await Promise.all([
      callDO(ref1, 1005, 1000),
      callDO(ref2, 1006, 1000)
    ]);

    // Both provider notifications are handled; one fulfils and one enters review.
    const statuses = [res1.status, res2.status];
    expect(statuses).toEqual([200, 200]);

    const states = await env.DB.prepare("SELECT status FROM \"Order\" WHERE id IN (SELECT orderId FROM Payment WHERE reference IN (?, ?)) ORDER BY status").bind(ref1, ref2).all<{ status: string }>();
    expect(states.results.map((row) => row.status).sort()).toEqual(["PAID", "PAYMENT_REVIEW"]);

    const variant = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(varId).first();
    expect(variant!.stockQuantity).toBe(0);
    // Reserved quantity drops by 1 for the successful one, the failed one doesn't drop it.
    expect(variant!.reservedQuantity).toBe(1);
  });

  test("Duplicate payment notifications", async () => {
    const varId = await seedBasicProduct(2, 1);
    const ref = "TEST_REF_DUP";
    await createOrder(varId, 1, ref, 1000);

    // Call DO twice with same ref and transaction ID (webhook + callback)
    const [res1, res2] = await Promise.all([
      callDO(ref, 1007, 1000),
      callDO(ref, 1007, 1000)
    ]);

    // First one succeeds
    const datas = await Promise.all([res1.json() as any, res2.json() as any]);
    const processedCount = datas.filter(d => d.alreadyProcessed).length;
    const successCount = datas.filter(d => d.success && !d.alreadyProcessed).length;

    expect(processedCount).toBe(1);
    expect(successCount).toBe(1);

    const variant = await env.DB.prepare("SELECT * FROM ProductVariant WHERE id = ?").bind(varId).first();
    expect(variant!.stockQuantity).toBe(1); // Only decremented once
  });

  test("Missing reservation records payment once and creates one review task", async () => {
    const varId = await seedBasicProduct(2, 1);
    const ref = "TEST_REF_REVIEW_DUP";
    const { orderId, resId } = await createOrder(varId, 1, ref, 1000);
    await env.DB.prepare("DELETE FROM InventoryReservation WHERE id = ?").bind(resId).run();

    const first = await callDO(ref, 2001, 1000);
    const second = await callDO(ref, 2001, 1000);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const order = await env.DB.prepare("SELECT status FROM \"Order\" WHERE id = ?").bind(orderId).first();
    const payment = await env.DB.prepare("SELECT status, providerTransactionId FROM Payment WHERE orderId = ?").bind(orderId).first();
    const taskCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM PaymentReviewTask WHERE orderId = ?").bind(orderId).first<{ count: number }>();
    const historyCount = await env.DB.prepare("SELECT COUNT(*) AS count FROM OrderStatusHistory WHERE orderId = ? AND status = 'PAYMENT_REVIEW'").bind(orderId).first<{ count: number }>();
    expect(order!.status).toBe("PAYMENT_REVIEW");
    expect(payment!.status).toBe("SUCCESS");
    expect(payment!.providerTransactionId).toBe(2001);
    expect(taskCount!.count).toBe(1);
    expect(historyCount!.count).toBe(1);
  });
});
