import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import {
  BadRequestError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport } from "../../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const { artist_id, otp } = await request.json();

    const isOtpActive = await VerificationCodes.findOne({
      author: artist_id,
      code: otp,
    });

    if (!isOtpActive) throw new BadRequestError("Invalid OTP code");

    const delete_code = await VerificationCodes.deleteOne({
      author: artist_id,
      code: otp,
    });

    if (delete_code.deletedCount === 0)
      throw new ServerError("An error has occured. Please contact support");

    return NextResponse.json(
      {
        message: "OTP code validated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);
    createErrorRollbarReport(
      "wallet: pin recovery -> verify otp code",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
