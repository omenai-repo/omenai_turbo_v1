import { parseRegisterData } from "@omenai/shared-lib/auth/parseRegisterData";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { NextResponse, NextResponse as res } from "next/server";
import {
  ConflictError,
  ForbiddenError,
  ServerError,
  ServiceUnavailableError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { sendIndividualMail } from "@omenai/shared-emails/src/models/individuals/sendIndividualMail";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { createErrorRollbarReport } from "../../../util";
import { redis } from "@omenai/upstash-config";
export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const isCollectorOnboardingEnabled =
        (await fetchConfigCatValue("collectoronboardingenabled", "low")) ??
        false;

      if (!isCollectorOnboardingEnabled)
        throw new ServiceUnavailableError(
          "Collector onboarding is currently disabled"
        );

      await connectMongoDB();

      const data = await request.json();

      const isAccountRegistered = await AccountIndividual.findOne(
        { email: data.email.toLowerCase() },
        "email"
      ).exec();

      if (isAccountRegistered)
        throw new ConflictError("Account already exists, please login");

      const parsedData = await parseRegisterData(data);

      const email_token = generateDigit(7);

      const saveData = await AccountIndividual.create({
        ...parsedData,
        email: parsedData.email.toLowerCase(),
      });

      if (!saveData)
        throw new ServerError("A server error has occured, please try again");
      const { user_id, email } = saveData;

      const userAgent: string = request.headers.get("User-Agent") ?? "";
      const authorization: string = request.headers.get("Authorization") ?? "";

      if (userAgent === process.env.MOBILE_USER_AGENT) {
        if (
          authorization === process.env.APP_AUTHORIZATION_SECRET &&
          data.device_push_token
        ) {
          await DeviceManagement.create({
            device_push_token: data.device_push_token,
            auth_id: user_id,
          });
        }
      }

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
      createErrorRollbarReport(
        "auth: user register",
        error,
        error_response.status
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
