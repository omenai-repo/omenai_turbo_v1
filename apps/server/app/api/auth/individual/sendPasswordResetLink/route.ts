import { sendPasswordRecoveryMail } from "@omenai/shared-emails/src/models/recovery/sendPasswordRecoveryMail";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse } from "next/server";
import {
  NotFoundError,
  ForbiddenError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";
const SendPasswordResentLinkSchema = z.object({
  recoveryEmail: z.email(),
});
export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { recoveryEmail } = await validateRequestBody(
        request,
        SendPasswordResentLinkSchema,
      );

      const data = await AccountIndividual.findOne(
        { email: recoveryEmail.toLowerCase() },
        "email user_id name verified",
      ).exec();

      if (!data)
        throw new NotFoundError("Email is not associated to any account");

      const { email, user_id, name, verified } = data;

      if (!verified)
        throw new ForbiddenError("Please verify your account first.");

      const email_token = await generateDigit(7);

      const isVerificationTokenActive = await VerificationCodes.findOne({
        author: user_id,
      });

      if (isVerificationTokenActive)
        throw new ForbiddenError(
          "Token link active. Please visit link to continue",
        );

      const storeVerificationCode = await VerificationCodes.create({
        code: email_token,
        author: user_id,
      });

      if (!storeVerificationCode)
        throw new ServerError("A server error has occured, please try again");

      await sendPasswordRecoveryMail({
        name: name,
        email: email,
        token: email_token,
        route: "individual",
      });

      return NextResponse.json(
        { message: "Verification link sent" },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "auth: user send password reset link",
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
