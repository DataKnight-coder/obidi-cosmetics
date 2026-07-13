import { NextRequest, NextResponse } from "next/server";
import { isValidPaystackSignature } from "@/lib/paystack/signature";
import { finalizeSuccessfulPayment } from "@/lib/payments/finalize-payment";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature || !isValidPaystackSignature(rawBody, signature)) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event !== "charge.success") {
      return new NextResponse("Ignored", { status: 200 });
    }

    const data = event.data;
    const reference = data.reference;
    const amount = data.amount;
    const currency = data.currency;
    const id = data.id;
    const channel = data.channel;
    const paidAt = data.paid_at;

    await finalizeSuccessfulPayment({
      reference,
      providerTransactionId: BigInt(id),
      amountKobo: amount,
      currency,
      channel,
      paidAt: paidAt ? new Date(paidAt) : undefined,
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    // Return 500 so Paystack retries if it's an internal error
    return new NextResponse("Webhook Processing Error", { status: 500 });
  }
}
