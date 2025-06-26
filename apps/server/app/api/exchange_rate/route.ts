import { lenientRateLimit } from "./../../../../../node_modules/@omenai/shared-lib/auth/configs/rate_limit_configs";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
const config: CombinedConfig = {
  ...lenientRateLimit,
  allowedRoles: ["artist", "gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    const { currency, amount } = await request.json();

    const data = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env
        .EXCHANGE_RATE_API_KEY!}/pair/${currency}/USD/${amount}`,
      { method: "GET" }
    );

    const result = await data.json();

    return NextResponse.json({ data: result.conversion_result });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
