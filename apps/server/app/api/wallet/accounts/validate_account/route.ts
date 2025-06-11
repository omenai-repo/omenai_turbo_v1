import { NextResponse } from "next/server";
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
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(standardRateLimit)(
  async function POST(request: Request) {
    try {
      const { bankCode, accountNumber } = await request.json();

      if (!bankCode || !accountNumber)
        throw new BadRequestError(
          "Invalid parameters - Bank code or Account number missing"
        );

      const response = await fetch(
        `https://api.flutterwave.com/v3/accounts/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
          },
          body: JSON.stringify({
            account_number: accountNumber,
            account_bank: bankCode,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          { message: result.message },
          { status: response.status }
        );
      }

      return NextResponse.json(
        {
          message: "Bank account validated successfully",
          account_data: result.data,
        },
        { status: response.status }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      console.log(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
