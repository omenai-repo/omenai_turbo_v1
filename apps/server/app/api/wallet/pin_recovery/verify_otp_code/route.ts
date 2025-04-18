import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextResponse } from "next/server";

import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import { isRepeatingOrConsecutive } from "@omenai/shared-utils/src/checkIfPinRepeating";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import {
  BadRequestError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import Server from "next/dist/server/base-server";
export async function POST(request: Request) {
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

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
