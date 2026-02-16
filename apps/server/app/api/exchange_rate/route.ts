import { lenientRateLimit } from "./../../../../../node_modules/@omenai/shared-lib/auth/configs/rate_limit_configs";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../util";
import z from "zod";
const config: CombinedConfig = {
  ...lenientRateLimit,
  allowedRoles: ["artist", "gallery"],
};
const ExchangeRateSchema = z.object({
  currency: z.string(),
  amount: z.number(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const { currency, amount } = await validateRequestBody(
      request,
      ExchangeRateSchema,
    );

    const data = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env
        .EXCHANGE_RATE_API_KEY!}/pair/${currency}/USD/${amount}`,
      { method: "GET" },
    );

    const result = await data.json();

    return NextResponse.json({ data: result.conversion_result });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("exchange rate", error, error_response.status);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
