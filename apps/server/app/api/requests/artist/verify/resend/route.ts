import { sendArtistVerifiedMail } from "@omenai/shared-emails/src/models/artist/sendArtistVerifiedMail";
import { getIp } from "@omenai/shared-lib/auth/getIp";
import { limiter } from "@omenai/shared-lib/auth/limiter";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse } from "next/server";
import {
  RateLimitExceededError,
  NotFoundError,
  ForbiddenError,
  ServerError,
} from "../../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

export async function POST(request: Request) {
  try {
    // const ip = await getIp();

    // const { success } = await limiter.limit(ip);
    // if (!success)
    //   throw new RateLimitExceededError("Too many requests, try again later.");

    await connectMongoDB();

    const { author } = await request.json();

    const { name, email, verified } = await AccountArtist.findOne(
      { artist_id: author },
      "name email verified"
    ).exec();

    if (!name || !email)
      throw new NotFoundError("Unable to authenticate account");

    if (verified)
      throw new ForbiddenError(
        "This action is not permitted. Account already verified"
      );

    const email_token = generateDigit(7);

    const isVerificationTokenActive = await VerificationCodes.findOne({
      author,
    });

    if (isVerificationTokenActive)
      await VerificationCodes.deleteOne({
        author,
        code: isVerificationTokenActive.code,
      });

    const storeVerificationCode = await VerificationCodes.create({
      code: email_token,
      author,
    });

    if (!storeVerificationCode)
      throw new ServerError("A server error has occured, please try again");

    await sendArtistVerifiedMail({
      name,
      email,
      token: email_token,
    });

    return NextResponse.json(
      {
        message: "Verification code resent",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
