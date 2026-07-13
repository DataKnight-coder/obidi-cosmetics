// custom-worker.ts
// @ts-ignore
import handler from "./.open-next/worker.js";
import {
  validatePaymentReservations,
  type OrderItemRecord,
  type ReservationRecord,
} from "./src/lib/payments/reservation-validation";

type OutboxQueueMessage = { eventId: string; orderId: string; eventName: string };

interface WorkerEnv {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
  ANALYTICS_QUEUE: { send(message: OutboxQueueMessage): Promise<unknown> };
  EMAIL_QUEUE: { send(message: OutboxQueueMessage): Promise<unknown> };
  GA4_API_SECRET?: string;
  GA4_MEASUREMENT_ID?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}
// OpenNext durable objects export
// @ts-ignore
export * from "./.open-next/worker.js";

// Export the OpenNext fetch handler
export default {
  async fetch(request: Request, env: any, ctx: any) {
    return handler.fetch(request, env, ctx);
  },
  
  async queue(batch: MessageBatch<any>, env: any, ctx: any) {
    for (const message of batch.messages) {
      if (
        batch.queue === "obidi-analytics-staging" ||
        batch.queue === "obidi-analytics-queue" ||
        batch.queue === "obidi-analytics"
      ) {
        await processAnalyticsMessage(message, env);
      } else if (
        batch.queue === "obidi-email-staging" ||
        batch.queue === "obidi-email-queue" ||
        batch.queue === "obidi-email"
      ) {
        await processEmailMessage(message, env);
      } else {
        message.ack();
      }
    }
  },

  async scheduled(_event: ScheduledController, env: WorkerEnv, _ctx: ExecutionContext) {
    const now = new Date().toISOString();
    const summary = { reservationsReleased: 0, analyticsRepublished: 0, emailRepublished: 0, skippedPaidOrders: 0, failures: 0 };

    const skipped = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM InventoryReservation r JOIN "Order" o ON o.id = r.orderId
       WHERE r.expiresAt <= ? AND r.releasedAt IS NULL AND r.consumedAt IS NULL
       AND (o.status IN ('PAID', 'PAYMENT_REVIEW') OR EXISTS
         (SELECT 1 FROM Payment p WHERE p.orderId = r.orderId AND p.status = 'SUCCESS'))`
    ).bind(now).first<{ count: number }>();
    summary.skippedPaidOrders = Number(skipped?.count || 0);

    const expired = await env.DB.prepare(
      `SELECT r.* FROM InventoryReservation r JOIN "Order" o ON o.id = r.orderId
       WHERE r.expiresAt <= ? AND r.releasedAt IS NULL AND r.consumedAt IS NULL
       AND o.status IN ('PENDING', 'ABANDONED')
       AND NOT EXISTS (SELECT 1 FROM Payment p WHERE p.orderId = r.orderId AND p.status = 'SUCCESS')
       LIMIT 100`
    ).bind(now).all<ReservationRecord & { quantity: number }>();

    for (const reservation of expired.results) {
      try {
        const results = await env.DB.batch([
          env.DB.prepare("UPDATE ProductVariant SET reservedQuantity = reservedQuantity - ? WHERE id = ?").bind(reservation.quantity, reservation.variantId),
          env.DB.prepare("UPDATE InventoryReservation SET releasedAt = ? WHERE id = ? AND releasedAt IS NULL AND consumedAt IS NULL").bind(now, reservation.id),
        ]);
        if (results.every((result) => result.meta.changes === 1)) summary.reservationsReleased += 1;
        else summary.failures += 1;
      } catch {
        summary.failures += 1;
      }
    }

    const pendingAnalytics = await env.DB.prepare(
      "SELECT id, orderId, eventName FROM AnalyticsEvent WHERE ((status = 'PENDING' AND queuedAt IS NULL) OR (status = 'RETRYABLE' AND nextAttemptAt <= ?)) AND attempts < maxAttempts LIMIT 100"
    ).bind(now).all<{ id: string; orderId: string; eventName: string }>();
    for (const outbox of pendingAnalytics.results) {
      try {
        await env.ANALYTICS_QUEUE.send({ eventId: outbox.id, orderId: outbox.orderId, eventName: outbox.eventName });
        await env.DB.prepare("UPDATE AnalyticsEvent SET status = 'QUEUED', queuedAt = ? WHERE id = ?").bind(now, outbox.id).run();
        summary.analyticsRepublished += 1;
      } catch { summary.failures += 1; }
    }

    const pendingEmails = await env.DB.prepare(
      "SELECT id, orderId, eventName FROM EmailEvent WHERE ((status = 'PENDING' AND queuedAt IS NULL) OR (status = 'RETRYABLE' AND nextAttemptAt <= ?)) AND attempts < maxAttempts LIMIT 100"
    ).bind(now).all<{ id: string; orderId: string; eventName: string }>();
    for (const outbox of pendingEmails.results) {
      try {
        await env.EMAIL_QUEUE.send({ eventId: outbox.id, orderId: outbox.orderId, eventName: outbox.eventName });
        await env.DB.prepare("UPDATE EmailEvent SET status = 'QUEUED', queuedAt = ? WHERE id = ?").bind(now, outbox.id).run();
        summary.emailRepublished += 1;
      } catch { summary.failures += 1; }
    }

    console.log(JSON.stringify({ event: "scheduled_summary", ...summary }));
  }
};

async function processAnalyticsMessage(message: Message<any>, env: any) {
  const msgBody = message.body;
  const candidateId = msgBody?.eventId ?? msgBody?.id;
  if (typeof candidateId !== "string" || candidateId.length === 0) {
    message.ack();
    return;
  }
  const eventId = candidateId;

  try {
    const event = await env.DB.prepare("SELECT * FROM AnalyticsEvent WHERE id = ?").bind(eventId).first();
    if (!event) {
      message.ack();
      return;
    }

    if (event.status === "SENT" || event.status === "DEAD") {
      message.ack();
      return;
    }

    // Mark as PROCESSING
    await env.DB.prepare("UPDATE AnalyticsEvent SET status = 'PROCESSING', processingAt = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(eventId).run();

    const payload = JSON.parse(event.payloadJson);
    const apiSecret = env.GA4_API_SECRET;
    const measurementId = env.GA4_MEASUREMENT_ID;
    
    if (!apiSecret || !measurementId) {
      throw new Error("GA4 credentials not configured");
    }

    const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: payload.client_id,
        events: [{
          name: "purchase",
          params: {
            currency: payload.currency,
            value: payload.value / 100,
            transaction_id: payload.transaction_id
          }
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`GA4 API returned status ${response.status}`);
    }

    await env.DB.prepare("UPDATE AnalyticsEvent SET status = 'SENT', sentAt = CURRENT_TIMESTAMP, providerMessageId = ? WHERE id = ?")
      .bind(payload.transaction_id, eventId).run();

    message.ack();
  } catch (error: any) {
    console.error("Analytics Outbox Consumer Error:", error.message);
    try {
      const event = await env.DB.prepare("SELECT * FROM AnalyticsEvent WHERE id = ?").bind(eventId).first();
      const attempts = (event?.attempts || 0) + 1;
      const maxAttempts = event?.maxAttempts || 5;
      if (attempts >= maxAttempts) {
        await env.DB.prepare("UPDATE AnalyticsEvent SET status = 'DEAD', lastError = ?, attempts = ? WHERE id = ?").bind(error.message, attempts, eventId).run();
        message.ack();
      } else {
        const nextAttemptAt = new Date(Date.now() + 60000 * Math.pow(2, attempts - 1)).toISOString();
        await env.DB.prepare("UPDATE AnalyticsEvent SET status = 'RETRYABLE', lastError = ?, nextAttemptAt = ?, attempts = ? WHERE id = ?").bind(error.message, nextAttemptAt, attempts, eventId).run();
        message.retry();
      }
    } catch {
      message.retry();
    }
  }
}

async function processEmailMessage(message: Message<any>, env: any) {
  const msgBody = message.body;
  const candidateId = msgBody?.eventId ?? msgBody?.id;
  if (typeof candidateId !== "string" || candidateId.length === 0) {
    message.ack();
    return;
  }
  const eventId = candidateId;

  try {
    const event = await env.DB.prepare("SELECT * FROM EmailEvent WHERE id = ?").bind(eventId).first();
    if (!event) {
      message.ack();
      return;
    }

    if (event.status === "SENT" || event.status === "DEAD") {
      message.ack();
      return;
    }

    // Mark as PROCESSING
    await env.DB.prepare("UPDATE EmailEvent SET status = 'PROCESSING', processingAt = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(eventId).run();

    const resendApiKey = env.RESEND_API_KEY;
    const emailFrom = env.EMAIL_FROM;

    if (!resendApiKey || !emailFrom) {
      throw new Error("Resend credentials not configured");
    }

    const orderData = await env.DB.prepare("SELECT * FROM \"Order\" WHERE id = ?").bind(event.orderId).first();
    if (!orderData) throw new Error("Order not found");

    const payload = JSON.parse(event.payloadJson);

    // Template rendering inside consumer
    let subject = "";
    let html = "";
    if (event.templateName === "order_confirmation") {
      subject = `Your OBIDI SEE MY HOUSE I STILL DEY WAKA COSMETICS Order #${orderData.id.slice(-8).toUpperCase()}`;
      html = `<p>Hi ${payload.customerName},</p><p>Thank you for your order! Your payment of NGN ${payload.totalKobo / 100} was successful.</p>`;
    } else {
      throw new Error(`Unknown template: ${event.templateName}`);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: emailFrom,
        to: event.recipient,
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API returned ${response.status}: ${errorText}`);
    }

    const resJson = await response.json() as any;
    const providerMessageId = resJson?.id || "unknown_resend_id";

    await env.DB.prepare("UPDATE EmailEvent SET status = 'SENT', sentAt = CURRENT_TIMESTAMP, providerMessageId = ? WHERE id = ?")
      .bind(providerMessageId, eventId).run();

    message.ack();
  } catch (error: any) {
    console.error("Email Outbox Consumer Error:", error.message);
    try {
      const event = await env.DB.prepare("SELECT * FROM EmailEvent WHERE id = ?").bind(eventId).first();
      const attempts = (event?.attempts || 0) + 1;
      const maxAttempts = event?.maxAttempts || 5;
      if (attempts >= maxAttempts) {
        await env.DB.prepare("UPDATE EmailEvent SET status = 'DEAD', lastError = ?, attempts = ? WHERE id = ?").bind(error.message, attempts, eventId).run();
        message.ack();
      } else {
        const nextAttemptAt = new Date(Date.now() + 60000 * Math.pow(2, attempts - 1)).toISOString();
        await env.DB.prepare("UPDATE EmailEvent SET status = 'RETRYABLE', lastError = ?, nextAttemptAt = ?, attempts = ? WHERE id = ?").bind(error.message, nextAttemptAt, attempts, eventId).run();
        message.retry();
      }
    } catch {
      message.retry();
    }
  }
}

// Durable Object payment finalization coordinator
export class PaymentCoordinator {
  state: DurableObjectState;
  env: WorkerEnv;

  constructor(state: DurableObjectState, env: WorkerEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    try {
      const body = await request.json() as {
        reference?: string;
        providerTransactionId?: string;
        amountKobo?: number;
        currency?: string;
        channel?: string;
        paidAt?: string;
      };
      const { reference, providerTransactionId, amountKobo, currency, channel, paidAt } = body;
      if (!reference || !providerTransactionId || !Number.isSafeInteger(amountKobo) || currency !== "NGN") {
        return Response.json({ success: false, error: "Invalid verified payment data" }, { status: 400 });
      }

      const payment = await this.env.DB.prepare("SELECT * FROM Payment WHERE reference = ?").bind(reference).first<{
        id: string; orderId: string; status: string; reference: string; expectedAmountKobo: number; currency: string;
      }>();
      if (!payment) {
        return Response.json({ success: false, error: "Payment not found" }, { status: 404 });
      }
      if (payment.status === "SUCCESS") {
        const existingOrder = await this.env.DB.prepare("SELECT status FROM \"Order\" WHERE id = ?").bind(payment.orderId).first<{ status: string }>();
        return Response.json({ success: true, alreadyProcessed: true, orderId: payment.orderId, orderStatus: existingOrder?.status });
      }

      const existingTx = await this.env.DB.prepare("SELECT id FROM Payment WHERE providerTransactionId = ?").bind(providerTransactionId).first<{ id: string }>();
      if (existingTx && existingTx.id !== payment.id) {
        return Response.json({ success: false, error: "Provider transaction ID already used" }, { status: 409 });
      }
      if (payment.reference !== reference || payment.expectedAmountKobo !== amountKobo || payment.currency !== "NGN") {
        return Response.json({ success: false, error: "Amount or currency mismatch" }, { status: 400 });
      }

      const order = await this.env.DB.prepare("SELECT * FROM \"Order\" WHERE id = ?").bind(payment.orderId).first<{
        id: string; status: string; customerName: string; customerEmail: string; totalKobo: number; analyticsConsent: number; gaClientId: string | null;
      }>();
      if (!order || payment.orderId !== order.id) return Response.json({ success: false, error: "Order mismatch" }, { status: 409 });
      const orderItems = await this.env.DB.prepare("SELECT variantId, quantity FROM OrderItem WHERE orderId = ?").bind(order.id).all<OrderItemRecord>();
      const reservations = await this.env.DB.prepare("SELECT * FROM InventoryReservation WHERE orderId = ?").bind(order.id).all<ReservationRecord>();
      const validation = validatePaymentReservations({ orderId: order.id, orderStatus: order.status, orderItems: orderItems.results, reservations: reservations.results, now: new Date() });
      const now = paidAt && !Number.isNaN(Date.parse(paidAt)) ? new Date(paidAt).toISOString() : new Date().toISOString();
      const recordPaymentReview = async (failureCode: string) => {
        await this.env.DB.batch([
          this.env.DB.prepare("UPDATE Payment SET status = 'SUCCESS', providerTransactionId = ?, paidAmountKobo = ?, channel = ?, paidAt = ?, updatedAt = ? WHERE id = ? AND status != 'SUCCESS'").bind(providerTransactionId, amountKobo, channel ?? null, now, now, payment.id),
          this.env.DB.prepare("UPDATE \"Order\" SET status = 'PAYMENT_REVIEW', updatedAt = ? WHERE id = ? AND status != 'PAID'").bind(now, order.id),
          this.env.DB.prepare("INSERT OR IGNORE INTO OrderStatusHistory (id, orderId, status, source, sourceReference, notes, createdAt) VALUES (?, ?, 'PAYMENT_REVIEW', 'PAYSTACK', ?, ?, ?)").bind(crypto.randomUUID(), order.id, providerTransactionId, failureCode, now),
          this.env.DB.prepare("INSERT OR IGNORE INTO PaymentReviewTask (id, orderId, paymentId, safeFailureCode, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'OPEN', ?, ?)").bind(crypto.randomUUID(), order.id, payment.id, failureCode, now, now),
        ]);
        return Response.json({ success: true, alreadyProcessed: false, requiresReview: true, orderId: order.id, orderStatus: "PAYMENT_REVIEW" });
      };

      let inventoryFailureCode: "INVENTORY_CONFLICT" | null = null;
      if (validation.ok) {
        for (const reservation of validation.reservations) {
          const variant = await this.env.DB.prepare("SELECT stockQuantity, reservedQuantity FROM ProductVariant WHERE id = ?").bind(reservation.variantId).first<{ stockQuantity: number; reservedQuantity: number }>();
          if (!variant || variant.stockQuantity < reservation.quantity || variant.reservedQuantity < reservation.quantity) {
            inventoryFailureCode = "INVENTORY_CONFLICT";
            break;
          }
        }
      }

      if (!validation.ok || inventoryFailureCode) {
        const failureCode = validation.ok ? inventoryFailureCode! : validation.code;
        return recordPaymentReview(failureCode);
      }

      const statements: D1PreparedStatement[] = [];
      for (const reservation of validation.reservations) {
        statements.push(this.env.DB.prepare("UPDATE InventoryReservation SET consumedAt = ? WHERE id = ?").bind(now, reservation.id));
        statements.push(this.env.DB.prepare("UPDATE ProductVariant SET reservedQuantity = reservedQuantity - ? WHERE id = ?").bind(reservation.quantity, reservation.variantId));
        statements.push(this.env.DB.prepare("UPDATE ProductVariant SET stockQuantity = stockQuantity - ? WHERE id = ?").bind(reservation.quantity, reservation.variantId));
      }
      statements.push(this.env.DB.prepare("UPDATE Payment SET status = 'SUCCESS', providerTransactionId = ?, paidAmountKobo = ?, channel = ?, paidAt = ?, updatedAt = ? WHERE id = ?").bind(providerTransactionId, amountKobo, channel ?? null, now, now, payment.id));
      statements.push(this.env.DB.prepare("UPDATE \"Order\" SET status = 'PAID', updatedAt = ? WHERE id = ?").bind(now, order.id));
      statements.push(this.env.DB.prepare("INSERT INTO OrderStatusHistory (id, orderId, status, source, sourceReference, notes, createdAt) VALUES (?, ?, 'PAID', 'PAYSTACK', ?, 'Payment fulfilled', ?)").bind(crypto.randomUUID(), order.id, providerTransactionId, now));

      const analyticsEventId = crypto.randomUUID();
      const hasAnalytics = Boolean(order.analyticsConsent && order.gaClientId);
      if (order.analyticsConsent && order.gaClientId) {
        const payload = JSON.stringify({ client_id: order.gaClientId, currency: "NGN", value: order.totalKobo, transaction_id: payment.reference });
        statements.push(this.env.DB.prepare("INSERT INTO AnalyticsEvent (id, orderId, eventName, status, attempts, maxAttempts, payloadJson, createdAt, updatedAt) VALUES (?, ?, 'purchase', 'PENDING', 0, 5, ?, ?, ?)").bind(analyticsEventId, order.id, payload, now, now));
      }
      const emailEventId = crypto.randomUUID();
      const emailPayload = JSON.stringify({ customerName: order.customerName, totalKobo: order.totalKobo });
      statements.push(this.env.DB.prepare("INSERT INTO EmailEvent (id, orderId, eventName, recipient, templateName, payloadJson, status, attempts, maxAttempts, createdAt, updatedAt) VALUES (?, ?, 'order_confirmation', ?, 'order_confirmation', ?, 'PENDING', 0, 5, ?, ?)").bind(emailEventId, order.id, order.customerEmail, emailPayload, now, now));

      let results: D1Result[];
      try {
        results = await this.env.DB.batch(statements);
      } catch {
        return recordPaymentReview("FULFILMENT_BATCH_FAILED");
      }
      if (results.length !== statements.length || results.some((result) => result.meta.changes !== 1)) {
        return recordPaymentReview("FULFILMENT_BATCH_RESULT_MISMATCH");
      }

      if (hasAnalytics) {
        try {
          await this.env.ANALYTICS_QUEUE.send({ eventId: analyticsEventId, orderId: order.id, eventName: "purchase" });
          await this.env.DB.prepare("UPDATE AnalyticsEvent SET status = 'QUEUED', queuedAt = ? WHERE id = ?").bind(now, analyticsEventId).run();
        } catch { console.error(JSON.stringify({ event: "queue_publish_failed", queue: "analytics", eventId: analyticsEventId })); }
      }
      try {
        await this.env.EMAIL_QUEUE.send({ eventId: emailEventId, orderId: order.id, eventName: "order_confirmation" });
        await this.env.DB.prepare("UPDATE EmailEvent SET status = 'QUEUED', queuedAt = ? WHERE id = ?").bind(now, emailEventId).run();
      } catch { console.error(JSON.stringify({ event: "queue_publish_failed", queue: "email", eventId: emailEventId })); }

      return Response.json({ success: true, alreadyProcessed: false, requiresReview: false, orderId: order.id, orderStatus: "PAID" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(JSON.stringify({ event: "payment_finalization_error", code: message }));
      return Response.json({ success: false, error: "Payment finalization unavailable" }, { status: 500 });
    }
  }
}
