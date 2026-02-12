import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { NextResponse, NextResponse as res } from "next/server";
import {
  ConflictError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../../util";
import z from "zod";

const RegisterSchema = z.object({
  email: z.email(),
  access_role: z.enum(["Admin", "Owner", "Editor", "Viewer"]),
});

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { access_role, email } = await validateRequestBody(
        request,
        RegisterSchema,
      );

      const isAccountRegistered = await AccountAdmin.findOne(
        { email },
        "email",
      ).exec();

      if (isAccountRegistered)
        throw new ConflictError("Account already exists, please login");

      const email_token = generateDigit(7);

      const saveData = await AccountAdmin.create({
        ...data,
      });

      const { admin_id } = saveData;

      if (!saveData)
        throw new ServerError("A server error has occured, please try again");

      const storeVerificationCode = await VerificationCodes.create({
        code: email_token,
        author: saveData.admin_id,
      });

      if (!storeVerificationCode)
        throw new ServerError("A server error has occured, please try again");

      // await sendIndividualMail({
      //   name: saveData.name,
      //   email: saveData.email,
      //   token: email_token,
      // });

      return res.json(
        {
          message: "Administrator successfully registered",
          data: admin_id,
        },
        { status: 201 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "auth: admin register",
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
