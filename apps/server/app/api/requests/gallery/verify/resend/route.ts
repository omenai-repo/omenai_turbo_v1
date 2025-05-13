import { sendGalleryMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryMail";
import { getIp } from "@omenai/shared-lib/auth/getIp";
import { limiter } from "@omenai/shared-lib/auth/limiter";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
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

export async function POST(request: Request) {
  try {
    // const ip = await getIp();

    // const { success } = await limiter.limit(ip);
    // if (!success)
    //   throw new RateLimitExceededError("Too many requests, try again later.");

    await connectMongoDB();

    const { author } = await request.json();

    const gallery = await AccountGallery.findOne(
      { gallery_id: author },
      "admin email verified"
    ).exec();

    if (!gallery) throw new NotFoundError("Unable to authenticate account");

    if (gallery.verified)
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

    await sendGalleryMail({
      name: gallery.admin,
      email: gallery.email,
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
    console.log(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
