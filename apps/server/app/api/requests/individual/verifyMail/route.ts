import { getIp } from "@omenai/shared-lib/auth/getIp";
import { limiter } from "@omenai/shared-lib/auth/limiter";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { NextResponse } from "next/server";
import {
  RateLimitExceededError,
  ForbiddenError,
  BadRequestError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    const ip = await getIp();

    const { success } = await limiter.limit(ip);
    if (!success)
      throw new RateLimitExceededError("Too many requests, try again later.");

    const { params, token } = await request.json();

    await connectMongoDB();

    const user = await AccountIndividual.findOne(
      { user_id: params },
      "verified"
    ).exec();

    if (user.verified)
      throw new ForbiddenError(
        "This action is not permitted, account already verified"
      );

    const isTokenActive = await VerificationCodes.findOne({
      author: params,
      code: token,
    }).exec();

    if (!isTokenActive) throw new BadRequestError("Invalid token data");

    await AccountIndividual.updateOne({ user_id: params }, { verified: true });

    await VerificationCodes.deleteOne({ code: token, author: params });

    return NextResponse.json(
      { message: "Verification was successful. Please login" },
      { status: 200 }
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
