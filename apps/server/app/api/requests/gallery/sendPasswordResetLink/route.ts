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

import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../../util";
export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { recoveryEmail } = await request.json();

      const data = await AccountGallery.findOne(
        { email: recoveryEmail },
        "email gallery_id admin name verified",
      ).exec();

      if (!data)
        throw new NotFoundError("Email is not associated to any account");

      const { email, gallery_id, admin, name, verified } = data;

      if (!verified)
        throw new ForbiddenError("Please verifiy your account first.");

      const email_token = await generateDigit(7);

      const isVerificationTokenActive = await VerificationCodes.findOne({
        author: gallery_id,
      });

      if (isVerificationTokenActive)
        throw new ForbiddenError(
          "Token link already exists. Please visit link to continue",
        );

      const storeVerificationCode = await VerificationCodes.create({
        code: email_token,
        author: gallery_id,
      });

      if (!storeVerificationCode)
        throw new ServerError("A server error has occured, please try again");

      await sendPasswordRecoveryMail({
        name: admin,
        email: email,
        token: email_token,
        gallery_name: name,
        route: "gallery",
      });

      return NextResponse.json(
        { message: "Password reset link has been sent", id: gallery_id },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "gallery: send password reset link",
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
