import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams.reason || "unknown";

  const getReasonText = () => {
    switch (reason) {
      case "missing_reference": return "We couldn't find a payment reference for this transaction.";
      case "payment_not_found": return "The transaction record could not be located in our system.";
      case "verification_failed": return "We could not verify the payment with the gateway.";
      case "payment_declined": return "Your payment was declined or abandoned.";
      default: return "An unexpected error occurred while processing your payment.";
    }
  };

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <XCircle className="text-error w-24 h-24 mb-6" />
      <h1 className="font-display-lg text-4xl mb-4 text-on-surface">Payment Failed</h1>
      <p className="text-on-surface-variant mb-8 text-lg">
        {getReasonText()}
      </p>

      <div className="flex flex-col gap-4 w-full">
        <Link href="/checkout" className="w-full bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-widest font-label-sm hover:scale-105 transition-transform">
          Try Again
        </Link>
        <Link href="/shop" className="w-full bg-white/10 text-on-surface px-8 py-4 rounded-full uppercase tracking-widest font-label-sm hover:bg-white/20 transition-colors">
          Return to Shop
        </Link>
      </div>
    </main>
  );
}
