import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";

import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../util";

export const GET = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const source = searchParams.get("source");
    const destination = searchParams.get("destination");
    const amount = searchParams.get("amount");

    try {
      if (!source || !destination || !amount)
        throw new BadRequestError("Invalid url params");

      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      };

      const response = await fetch(
        `https://api.flutterwave.com/v3/transfers/rates?amount=${amount}&destination_currency=${destination.toUpperCase()}&source_currency=${source.toUpperCase()}`,
        options,
      );

      const result = await response.json();

      if (!response.ok)
        return NextResponse.json({ message: result.message }, { status: 400 });
      return NextResponse.json(
        { message: "Transfer rate retrieved", data: result.data },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "flutterwave: get transfert rate",
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
