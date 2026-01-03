import crypto from "node:crypto";
import z from "zod";
export async function verifyWebhookSignature(
  signature: string | null,
  secretHash: string
): Promise<boolean> {
  if (!signature) return false;

  const signatureBuffer = Buffer.from(signature, "utf8");
  const secretHashBuffer = Buffer.from(secretHash, "utf8");

  if (signatureBuffer.length !== secretHashBuffer.length) return false;

  return crypto.timingSafeEqual(
    new Uint8Array(signatureBuffer),
    new Uint8Array(secretHashBuffer)
  );
}

export async function verifyFlutterwaveTransaction(
  req: any,
  url: string
): Promise<any> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
    },
  });

  if (!response.ok) throw new Error("Transaction verification failed");

  const verified_transaction = await response.json();
  if (
    verified_transaction.status === "success" &&
    verified_transaction.data.reference === req.data.reference &&
    verified_transaction.data.amount === req.data.amount &&
    verified_transaction.data.currency === req.data.currency
  ) {
    return verified_transaction;
  } else throw new Error("Transaction could not be validated");
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 100
): Promise<T> {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await new Promise(
          (res) => setTimeout(res, delayMs * attempt) // simple backoff
        );
      }
    }
  }

  throw lastError;
}
