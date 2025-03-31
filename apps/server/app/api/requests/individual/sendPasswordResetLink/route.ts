import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse } from "next/server";
import {
  NotFoundError,
  ForbiddenError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { sendPasswordRecoveryMail } from "@omenai/shared-emails/src/models/recovery/sendPasswordRecoveryMail";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { recoveryEmail } = await request.json();

    const data = await AccountIndividual.findOne(
      { email: recoveryEmail },
      "email user_id name verified name"
    ).exec();

    if (!data)
      throw new NotFoundError("Email is not associated to any account");

    const { email, user_id, name, verified } = data;

    if (!verified)
      throw new ForbiddenError("Please verify your account first.");

    const email_token = generateDigit(7);

    const isVerificationTokenActive = await VerificationCodes.findOne({
      author: user_id,
    });

    if (isVerificationTokenActive)
      throw new ForbiddenError(
        "Token link already exists. Please visit link to continue"
      );

    const storeVerificationCode = await VerificationCodes.create({
      code: email_token,
      author: user_id,
    });

    if (!storeVerificationCode)
      throw new ServerError("A server error has occured, please try again");

    await sendPasswordRecoveryMail({
      name,
      email: email,
      token: email_token,
      gallery_name: name,
      route: "individual",
    });

    return NextResponse.json(
      { message: "Password reset link has been sent", id: user_id },
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
