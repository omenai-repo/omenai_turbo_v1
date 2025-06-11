import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { NextResponse, NextResponse as res } from "next/server";
import {
  ConflictError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { parseRegisterData } from "@omenai/shared-lib/auth/parseRegisterData";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const data = await request.json();

      const isAccountRegistered = await AccountAdmin.findOne(
        { email: data.email },
        "email"
      ).exec();

      if (isAccountRegistered)
        throw new ConflictError("Account already exists, please login");

      const parsedData = await parseRegisterData(data);

      const email_token = generateDigit(7);

      const saveData = await AccountAdmin.create({
        ...parsedData,
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
        { status: 201 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
