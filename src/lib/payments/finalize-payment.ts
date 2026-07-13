export interface FinalizePaymentParams {
  reference: string;
  providerTransactionId: bigint;
  amountKobo: number;
  currency: string;
  channel?: string;
  paidAt?: Date;
}


export async function finalizeSuccessfulPayment(params: FinalizePaymentParams) {
  // In OpenNext, bindings are injected into process.env
  const doNamespace = process.env.PAYMENT_COORDINATOR as any;
  if (!doNamespace) {
    throw new Error("PAYMENT_COORDINATOR binding not found. Please ensure it is configured in wrangler.");
  }

  // We use a single DO instance globally or per-order. 
  // Let's use a single global DO for all payments for simplicity, 
  // or a DO named by the orderId/reference for per-order concurrency.
  // Using per-reference concurrency ensures no two requests for the SAME payment overlap.
  const id = doNamespace.idFromName(params.reference);
  const stub = doNamespace.get(id);

  // Send the request to the DO
  const response = await stub.fetch("http://do/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...params,
      providerTransactionId: params.providerTransactionId.toString(),
      paidAt: params.paidAt?.toISOString(),
    }),
  });

  if (!response.ok) {
    let errText = "Unknown error";
    try {
      const errJson = await response.json();
      errText = errJson.error || JSON.stringify(errJson);
    } catch {
      errText = await response.text();
    }
    throw new Error(`Durable Object returned ${response.status}: ${errText}`);
  }

  const result = await response.json() as {
    success: boolean;
    alreadyProcessed: boolean;
    requiresReview?: boolean;
    orderId: string;
    orderStatus?: "PAID" | "PAYMENT_REVIEW";
  };
  return result;
}
