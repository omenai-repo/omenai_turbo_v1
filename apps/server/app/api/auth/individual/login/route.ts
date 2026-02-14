import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { IndividualSchemaTypes, SessionDataType } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  ConflictError,
  ServerError,
  ForbiddenError,
} from "../../../../../custom/errors/dictionary/errorDictionary"; // Added ForbiddenError
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
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { validateRequestBody } from "../../../util";
import z from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string(),
  device_push_token: z.string().optional(),
});

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request, response?: Response) {
    const cookieStore = await cookies();
    try {
      const data = await validateRequestBody(request, LoginSchema);
      const { email, password, device_push_token } = data;

      console.log(data);

      await connectMongoDB();

      // 1. Authenticate User
      const user = await AccountIndividual.findOne<IndividualSchemaTypes>({
        email: email.toLowerCase(),
      }).exec();

      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new ConflictError("Invalid credentials");
      }

      // 2. Prepare Session Data
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
      const mobileAccessKey: string | null =
        request.headers.get("X-Access-Key") || null;

      if (userAgent && userAgent === process.env.MOBILE_USER_AGENT) {
        if (
          !mobileAccessKey ||
          mobileAccessKey !== process.env.MOBILE_ACCESS_KEY
        ) {
          throw new ForbiddenError("Invalid App Credentials");
        }

        // A1. Update Push Token
        if (device_push_token) {
          await DeviceManagement.updateOne(
            { auth_id: sessionPayload.user_id },
            { $set: { device_push_token } },
            { upsert: true },
          );
        }

        // A2. CREATE SESSION (Redis Only)
        // We generate the ID here and store it in Redis.
        const sessionId = await createSession({
          userId: user.user_id,
          userData: sessionPayload,
          userAgent: userAgent,
        });

        // A3. RETURN JSON (No Cookie)
        // The mobile app will save 'access_token' in SecureStore
        return NextResponse.json(
          {
            success: true,
            message: "Login successful",
            data: {
              ...sessionPayload,
              access_token: sessionId,
              device_push_token,
            },
          },
          { status: 200 },
        );
      }

      // B1. Cleanup Deletion Requests (Business Logic)
      try {
        await DeletionRequestModel.deleteOne({
          targetId: user.user_id,
          gracePeriodUntil: { $gt: toUTCDate(new Date()) },
        });
      } catch (error) {
        createErrorRollbarReport(
          "auth: Deletion request removal failed",
          error,
          500,
        );
      }

      // B2. CREATE SESSION (Redis)
      const sessionId = await createSession({
        userId: user.user_id,
        userData: sessionPayload,
        userAgent,
      });

      // B3. SAVE COOKIE (Iron Session)
      const session = await getSessionFromCookie(cookieStore);
      session.sessionId = sessionId;
      await session.save();

      // B4. RETURN JSON (Cookie is in headers)
      return NextResponse.json(
        {
          success: true,
          message: "Login successful",
          data: sessionPayload,
        },
        { status: 200 },
      );
    } catch (error: any) {
      const errorResponse = handleErrorEdgeCases(error);
      createErrorRollbarReport("auth: user login", error, errorResponse.status);
      return NextResponse.json(
        { message: errorResponse?.message },
        { status: errorResponse?.status },
      );
    }
  },
);
