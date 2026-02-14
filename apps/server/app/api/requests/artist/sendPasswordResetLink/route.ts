import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
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
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";
const SendResetLinkSchema = z.object({
  recoveryEmail: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { recoveryEmail } = await validateRequestBody(
        request,
        SendResetLinkSchema,
      );

      const data = await AccountArtist.findOne(
        { email: recoveryEmail },
        "email artist_id name verified",
      ).exec();

      if (!data)
        throw new NotFoundError("Email is not associated to any account");

      const { email, artist_id, name, verified } = data;

      if (!verified)
        throw new ForbiddenError("Please verify your account first.");

      const email_token = generateDigit(7);

      const isVerificationTokenActive = await VerificationCodes.findOne({
        author: artist_id,
      });

      if (isVerificationTokenActive)
        throw new ForbiddenError(
          "Token link already exists. Please visit link to continue",
        );

      const storeVerificationCode = await VerificationCodes.create({
        code: email_token,
        author: artist_id,
      });

      if (!storeVerificationCode)
        throw new ServerError("A server error has occured, please try again");

      await sendPasswordRecoveryMail({
        name,
        email: email,
        token: email_token,
        gallery_name: name,
        route: "artist",
      });

      return NextResponse.json(
        { message: "Password reset link has been sent", id: artist_id },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "artist: password reset Link",
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
