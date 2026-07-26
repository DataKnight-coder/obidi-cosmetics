import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  
  if (!orderId) {
    return notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!order) {
    return notFound();
  }

  if (order.status === "PAYMENT_REVIEW") {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <CheckCircle className="text-primary w-24 h-24 mb-6" />
        <h1 className="font-display-lg text-4xl mb-4">Payment received</h1>
        <p className="text-on-surface-variant mb-8 text-lg">
          We received your payment. Your order requires confirmation from our team, and we will contact you after review.
        </p>
        <Link href="/" className="bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-widest font-label-sm">
          Return to Home
        </Link>
      </main>
    );
  }

  // Ensure only PAID orders show up here
  if (order.status !== "PAID") {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display-lg text-4xl mb-4">Processing...</h1>
        <p className="text-on-surface-variant mb-8">We are still waiting for confirmation from the payment provider.</p>
        <Link href="/" className="bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-widest font-label-sm hover:scale-105 transition-transform">
          Return to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
      <CheckCircle className="text-primary w-24 h-24 mb-6" />
      <h1 className="font-display-lg text-4xl mb-4 text-on-surface">Payment Successful!</h1>
      <p className="text-on-surface-variant mb-8 text-lg">
        Thank you, {order.customerName}! Your order <strong>#{order.id.slice(-8).toUpperCase()}</strong> has been confirmed.
      </p>

      <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-left mb-8 flex flex-col gap-4">
        <h2 className="font-headline-lg text-xl mb-2 text-primary">Order Details</h2>
        <div className="flex justify-between border-b border-white/10 pb-4">
          <span className="text-on-surface-variant">Amount Paid:</span>
          <span className="font-bold">₦{(order.totalKobo / 100).toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b border-white/10 pb-4">
          <span className="text-on-surface-variant">Delivery Address:</span>
          <span className="font-bold text-right max-w-[60%]">{order.shippingAddress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Contact:</span>
          <span className="font-bold">{order.customerEmail}</span>
        </div>
      </div>

      <Link href="/shop" className="bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-widest font-label-sm hover:scale-105 transition-transform">
        Continue Shopping
      </Link>
    </main>
  );
}
