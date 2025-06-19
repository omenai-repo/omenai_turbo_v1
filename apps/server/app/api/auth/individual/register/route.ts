import { parseRegisterData } from "@omenai/shared-lib/auth/parseRegisterData";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse, NextResponse as res } from "next/server";
import {
  ConflictError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { sendIndividualMail } from "@omenai/shared-emails/src/models/individuals/sendIndividualMail";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

import { clerkClient } from "@clerk/nextjs/server";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const data = await request.json();

      const isAccountRegistered = await AccountIndividual.findOne(
        { email: data.email },
        "email"
      ).exec();

      if (isAccountRegistered)
        throw new ConflictError("Account already exists, please login");

      const parsedData = await parseRegisterData(data);

      const email_token = generateDigit(7);

      const client = await clerkClient();
      const users = await client.users.getUserList({
        emailAddress: [parsedData.email],
      });

      let clerkUserId;

      if (users && users.data.length > 0) {
        // Email exists in Clerk
        clerkUserId = users.data[0].id;
      } else {
        const clerkUser = await client.users.createUser({
          emailAddress: [parsedData.email],
          publicMetadata: { role: "user" },
          skipPasswordRequirement: true,
        });

        if (!clerkUser)
          throw new ServerError(
            "Authentication service is currently down, please try again later or contact support"
          );

        clerkUserId = clerkUser.id;
      }

      const saveData = await AccountIndividual.create({
        ...parsedData,
        clerkUserId,
      });

      if (!saveData)
        throw new ServerError("A server error has occured, please try again");
      const { user_id, email } = saveData;

      const storeVerificationCode = await VerificationCodes.create({
        code: email_token,
        author: saveData.user_id,
      });

      if (!storeVerificationCode)
        throw new ServerError("A server error has occured, please try again");

      await sendIndividualMail({
        name: saveData.name,
        email: saveData.email,
        token: email_token,
      });

      return res.json(
        {
          message: "User successfully registered",
          data: user_id,
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
