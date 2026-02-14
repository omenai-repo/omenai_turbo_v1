import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { BadRequestError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["artist"],
};
const Schema = z.object({
  bankCode: z.string(),
  accountNumber: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const { bankCode, accountNumber } = await validateRequestBody(
      request,
      Schema,
    );

    if (!bankCode || !accountNumber)
      throw new BadRequestError(
        "Invalid parameters - Bank code or Account number missing",
      );

    const response = await fetch(
      `https://api.flutterwave.com/v3/accounts/resolve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
        body: JSON.stringify({
          account_number: String(accountNumber),
          account_bank: String(bankCode),
        }),
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
        message: "Bank account validated successfully",
        account_data: result.data,
      },
      { status: response.status },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "wallet: account -> validate account",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
