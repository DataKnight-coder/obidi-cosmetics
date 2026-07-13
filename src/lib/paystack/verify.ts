import { paystackFetch } from "./client";
import { PaystackVerifyResponse } from "./types";

export async function verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
  return paystackFetch<PaystackVerifyResponse>(`/transaction/verify/${encodeURIComponent(reference)}`);
}
