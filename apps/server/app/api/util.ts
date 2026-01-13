import { rollbarServerInstance } from "@omenai/rollbar-config";
import { ServerError } from "../../custom/errors/dictionary/errorDictionary";
import z from "zod";
import crypto from "node:crypto";

export function createErrorRollbarReport(
  context: string,
  error: any,
  status: number
) {
  if (status >= 500) {
    if (error instanceof ServerError) {
      rollbarServerInstance.error(error, {
        context,
      });
    } else {
      rollbarServerInstance.error(new Error(String(error)));
    }
  }
}

export const MetaSchema = z.object({
  buyer_email: z.email(),
  buyer_id: z.string().optional(),
  seller_id: z.string().optional(),
  seller_designation: z.string().optional(),
  art_id: z.string().optional(),
  unit_price: z.union([z.string(), z.number()]).optional(),
  shipping_cost: z.union([z.string(), z.number()]).optional(),
  tax_fees: z.union([z.string(), z.number()]).optional(),
});

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
function hashCode(str: string): number {
  let hash = 0;

  if (str.length === 0) {
    return hash;
  }

  for (const char of str) {
    const chr = char.codePointAt(0)!;

    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }

  return hash;
}

/**
 * This is an irreversible anonymized user ID using HMAC-SHA256.
 */
export function anonymizeUserId(userId: string, secret: string): string {
  const hash = crypto.createHmac("sha256", secret).update(userId).digest("hex");

  return `omenai_${hash.slice(0, 16)}`;
}

/**
 * A function to generate a display name like "Deleted User #4821 for anonymized user name"
 */
export function anonymizeUsername(userId?: string): string {
  const suffix = userId
    ? Math.abs(hashCode(userId)).toString().slice(0, 4)
    : crypto.randomInt(0, 10000).toString().padStart(4, "0");

  return `Deleted User #${suffix}`;
}
