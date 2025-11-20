import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { IndividualSchemaTypes, SessionDataType } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  ConflictError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  createSession,
  getSessionFromCookie,
} from "@omenai/shared-lib/auth/session";

import { cookies } from "next/headers";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { createErrorRollbarReport } from "../../../util";
// SERVER SIDE - Generate a sign-in token/ticket
export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request, response?: Response) {
    const cookieStore = await cookies();
    try {
      const { email, password, device_push_token } = await request.json();
      await connectMongoDB();

      // 1. Your existing authentication logic
      const user = await AccountIndividual.findOne<IndividualSchemaTypes>({
        email: email.toLowerCase(),
      }).exec();

      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new ConflictError("Invalid credentials");
      }

      const sessionPayload: SessionDataType = {
        id: user.user_id,
        user_id: user.user_id,
        name: user.name,
        preferences: user.preferences,
        address: user.address,
        role: user.role as "user",
        email: user.email,
        verified: user.verified,
      };

      const userAgent: string | null =
        request.headers.get("User-Agent") || null;
      const authorization: string | null =
        request.headers.get("Authorization") || null;

      if (userAgent && userAgent === process.env.MOBILE_USER_AGENT) {
        console.log("App user agent detected");
        if (
          authorization &&
          authorization === process.env.APP_AUTHORIZATION_SECRET
        ) {
          if (device_push_token)
            await DeviceManagement.updateOne(
              { auth_id: sessionPayload.user_id },
              { $set: { device_push_token } },
              { upsert: true }
            );
          return NextResponse.json(
            {
              success: true,
              message: "Login successful",
              data: { ...sessionPayload, device_push_token },
            },
            { status: 200 }
          );
        }
      }

      const session = await getSessionFromCookie(cookieStore);

      const sessionId = await createSession({
        userId: user.user_id,
        userData: sessionPayload,
        userAgent,
      });

      session.sessionId = sessionId;

      await session.save();

      return NextResponse.json(
        {
          success: true,
          message: "Login successful",
          data: sessionPayload,
        },
        { status: 200 }
      );
    } catch (error: any) {
      const errorResponse = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "auth: user login",
        error as any,
        errorResponse.status
      );
      console.log(error);
      return NextResponse.json(
        { message: errorResponse?.message },
        { status: errorResponse?.status }
      );
    }
  }
);
