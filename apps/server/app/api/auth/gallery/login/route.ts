import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { GallerySchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse, NextResponse as res } from "next/server";
import { ConflictError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  getSessionFromCookie,
  createSession,
} from "@omenai/shared-lib/auth/session";
import { cookies } from "next/headers";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { createErrorRollbarReport } from "../../../util";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const data = await request.json();

      const { email, password, device_push_token } = data;

      await connectMongoDB();

      const user = await AccountGallery.findOne<GallerySchemaTypes>({
        email: email.toLowerCase(),
      }).exec();

      if (!user) throw new ConflictError("Invalid credentials");

      const isPasswordMatch = bcrypt.compareSync(password, user.password);

      if (!isPasswordMatch) throw new ConflictError("Invalid credentials");
      const {
        gallery_id,
        verified,
        admin,
        description,
        address,
        gallery_verified,
        name,
        role,
        logo,
        subscription_status,
        connected_account_id,
        status,
        stripe_customer_id,
      } = user;

      const sessionPayload = {
        id: gallery_id,
        gallery_id,
        verified,
        admin,
        description,
        address,
        gallery_verified,
        name,
        role: role as "gallery",
        logo,
        subscription_status,
        connected_account_id,
        email: user.email,
        status,
        stripe_customer_id,
      };

      const userAgent: string | null =
        request.headers.get("User-Agent") || null;
      const authorization: string | null =
        request.headers.get("Authorization") || null;

      if (userAgent && userAgent === process.env.MOBILE_USER_AGENT) {
        if (
          authorization &&
          authorization === process.env.APP_AUTHORIZATION_SECRET
        ) {
          if (device_push_token)
            await DeviceManagement.updateOne(
              { auth_id: sessionPayload.gallery_id },
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

      try {
        await DeletionRequestModel.deleteOne({
          targetId: user.gallery_id,
          gracePeriodUntil: { $gt: toUTCDate(new Date()) },
        });
      } catch (error) {
        createErrorRollbarReport(
          "Auth - Gallery: Deletion request removal failed",
          error,
          500
        );
      }

      const cookieStore = await cookies();
      const session = await getSessionFromCookie(cookieStore);

      const sessionId = await createSession({
        userId: gallery_id,
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
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "auth: gallery login",
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
