import { sendPasswordConfirmationCodeMail } from "@omenai/shared-emails/src/models/gallery/sendPasswordChangeConfirmationCode";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse } from "next/server";
import {
  ServerError,
  ConflictError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();
      const { id } = await request.json();

      const account = await AccountIndividual.findOne({
        user_id: id,
      });
      if (!account) throw new ServerError("Something went wrong");
      const token = generateDigit(7);

      const check_code_existence = await VerificationCodes.findOne({
        author: account.user_id,
      });

      if (check_code_existence)
        throw new ConflictError("Token active, check your email or try later");

      const create_code = await VerificationCodes.create({
        code: token,
        author: account.user_id,
      });

      if (!create_code)
        throw new Error(
          "Something went wrong with this request, Please contact support."
        );

      await sendPasswordConfirmationCodeMail({
        username: account.name,
        token: token,
        email: account.email,
      });

      return NextResponse.json(
        { message: "Confirmation code sent to email address" },
        { status: 200 }
      );
    } catch (error) {
      console.log(error);
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
