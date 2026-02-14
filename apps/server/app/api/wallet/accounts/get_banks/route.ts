import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  createErrorRollbarReport,
  validateGetRouteParams,
} from "../../../util";
import z from "zod";
const Schema = z.object({
  countryCode: z.string(),
});
export const GET = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const countryCodeParams = searchParams.get("countryCode");
    try {
      const { countryCode } = validateGetRouteParams(Schema, {
        countryCode: countryCodeParams,
      });
      const response = await fetch(
        `https://api.flutterwave.com/v3/banks/${countryCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
        },
      );
      const result = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { message: result.message },
          { status: response.status },
        );
      }

      return NextResponse.json(
        {
          message: "Banks fetched successfully",
          no_of_banks: result.data.length,
          banks: result.data,
        },
        { status: response.status },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "wallet: account -> get banks",
        error,
        error_response.status,
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }
  },
);
