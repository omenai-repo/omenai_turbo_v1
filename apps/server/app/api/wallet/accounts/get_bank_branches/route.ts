import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../../util";

export const GET = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const bankCode = searchParams.get("bankCode");
    try {
      if (!bankCode)
        throw new BadRequestError("Invalid parameters - Bank code missing");

      const response = await fetch(
        `https://api.flutterwave.com/v3/banks/${bankCode}/branches`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
          },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        if ((result.message = "No branches found for specified bank id"))
          return NextResponse.json(
            {
              message: "Bank branches fetched successfully",
              no_of_bank_branches: 0,
              bank_branches: [],
            },
            { status: 200 }
          );
        return NextResponse.json(
          { message: result.message },
          { status: response.status }
        );
      }

      return NextResponse.json(
        {
          message: "Bank branches fetched successfully",
          no_of_bank_branches: result.data.length,
          bank_branches: result.data,
        },
        { status: response.status }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "wallet: account -> get bank branches",
        error as any,
        error_response.status
      );
      console.log(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
