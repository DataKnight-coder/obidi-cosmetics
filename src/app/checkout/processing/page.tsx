import Link from "next/link";
import { Loader2 } from "lucide-react";

export default async function CheckoutProcessingPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <Loader2 className="text-primary w-24 h-24 mb-6 animate-spin" />
      <h1 className="font-display-lg text-4xl mb-4 text-on-surface">Payment Processing</h1>
      <p className="text-on-surface-variant mb-8 text-lg">
        Your payment is currently being processed by the gateway. Please check back in a few minutes, or we will email you when it's confirmed!
      </p>

      {reference && (
        <p className="text-sm text-on-surface-variant/50 mb-8 font-mono">
          Ref: {reference}
        </p>
      )}

      <div className="flex flex-col gap-4 w-full">
        <Link href="/" className="w-full bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-widest font-label-sm hover:scale-105 transition-transform">
          Return to Home
        </Link>
      </div>
    </main>
  );
}
