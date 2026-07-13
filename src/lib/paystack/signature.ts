import crypto from "crypto";

export function isValidPaystackSignature(body: string, signature: string): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return false;

  const hash = crypto.createHmac("sha512", secretKey).update(body).digest("hex");
  
  // Use crypto.timingSafeEqual to prevent timing attacks
  try {
    const hashBuffer = Buffer.from(hash);
    const signatureBuffer = Buffer.from(signature);
    if (hashBuffer.length !== signatureBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
  } catch (e) {
    return false;
  }
}
