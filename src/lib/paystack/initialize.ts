import { paystackFetch } from "./client";
import { PaystackInitializeRequest, PaystackInitializeResponse } from "./types";

export async function initializeTransaction(
  payload: PaystackInitializeRequest
): Promise<PaystackInitializeResponse> {
  return paystackFetch<PaystackInitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
