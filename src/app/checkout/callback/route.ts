import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack/verify";
import { finalizeSuccessfulPayment } from "@/lib/payments/finalize-payment";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(new URL("/checkout/failed?reason=missing_reference", request.url));
  }

  try {
    // 1. Find local payment record
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.redirect(new URL("/checkout/failed?reason=payment_not_found", request.url));
    }

    if (payment.status === "SUCCESS" || payment.order.status === "PAID") {
      // Already processed (maybe by webhook)
      return NextResponse.redirect(new URL(`/checkout/success?orderId=${payment.orderId}`, request.url));
    }

    // 2. Verify with Paystack Server
    const paystackRes = await verifyTransaction(reference);

    if (!paystackRes.status || !paystackRes.data) {
      return NextResponse.redirect(new URL("/checkout/failed?reason=verification_failed", request.url));
    }

    const { status, amount, currency, id, channel, paid_at } = paystackRes.data;

    // 3. Status handling
    if (status === "success") {
      try {
        await finalizeSuccessfulPayment({
          reference,
          providerTransactionId: BigInt(id),
          amountKobo: amount,
          currency,
          channel,
          paidAt: paid_at ? new Date(paid_at) : undefined,
        });

        return NextResponse.redirect(new URL(`/checkout/success?orderId=${payment.orderId}`, request.url));
      } catch (err: any) {
        console.error("Finalization failed:", err.message);
        return NextResponse.redirect(new URL("/checkout/failed?reason=finalization_error", request.url));
      }
    } else if (["pending", "ongoing", "processing"].includes(status)) {
      return NextResponse.redirect(new URL(`/checkout/processing?reference=${reference}`, request.url));
    } else {
      // failed, abandoned, reversed, etc
      await prisma.payment.update({
        where: { reference },
        data: { status: status === "failed" ? "FAILED" : status === "abandoned" ? "ABANDONED" : "REVERSED" },
      });
      return NextResponse.redirect(new URL("/checkout/failed?reason=payment_declined", request.url));
    }
  } catch (error) {
    console.error("Callback Error:", error);
    return NextResponse.redirect(new URL("/checkout/failed?reason=internal_error", request.url));
  }
}
