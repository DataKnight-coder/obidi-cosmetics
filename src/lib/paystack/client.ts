export const PAYSTACK_API_BASE = "https://api.paystack.co";

export async function paystackFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  return response.json();
}
