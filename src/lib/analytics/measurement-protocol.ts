import { prisma } from "@/lib/prisma";

export async function processAnalyticsOutbox() {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.warn("Skipping GA4 Outbox: Credentials not set.");
    return { success: false, reason: "Credentials not set" };
  }

  // Fetch up to 50 pending or retryable events
  const events = await prisma.analyticsEvent.findMany({
    where: {
      status: { in: ["PENDING", "RETRYABLE"] },
      attempts: { lt: 5 },
    },
    take: 50,
  });

  if (events.length === 0) {
    return { success: true, processed: 0 };
  }

  let processedCount = 0;

  for (const event of events) {
    try {
      // Mark as PROCESSING
      await prisma.analyticsEvent.update({
        where: { id: event.id },
        data: { status: "PROCESSING", processingAt: new Date(), attempts: { increment: 1 } },
      });

      const payloadRaw = JSON.parse(event.payloadJson);
      
      const payload = {
        client_id: payloadRaw.client_id,
        events: [
          {
            name: event.eventName,
            params: {
              currency: payloadRaw.currency,
              value: payloadRaw.value,
              transaction_id: payloadRaw.transaction_id,
            },
          },
        ],
      };

      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        await prisma.analyticsEvent.update({
          where: { id: event.id },
          data: { status: "SENT", sentAt: new Date() },
        });
        
        // Also update the order for quick reference
        await prisma.order.update({
          where: { id: event.orderId },
          data: { analyticsPurchaseSentAt: new Date(), analyticsTransactionId: payloadRaw.transaction_id },
        });
        
        processedCount++;
      } else {
        const errorText = await response.text();
        throw new Error(`GA4 API Error: ${response.status} ${errorText}`);
      }
    } catch (error: any) {
      console.error(`Error processing analytics event ${event.id}:`, error.message);
      const isMaxed = event.attempts + 1 >= 5;
      await prisma.analyticsEvent.update({
        where: { id: event.id },
        data: { 
          status: isMaxed ? "DEAD" : "RETRYABLE", 
          lastError: error.message || "Unknown error",
          nextAttemptAt: new Date(Date.now() + 60000 * Math.pow(2, event.attempts)) // Exponential backoff
        },
      });
    }
  }

  return { success: true, processed: processedCount };
}
