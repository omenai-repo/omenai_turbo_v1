import { rollbarServerInstance } from "@omenai/rollbar-config";
import { ServerError } from "../../custom/errors/dictionary/errorDictionary";
import z from "zod";

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
