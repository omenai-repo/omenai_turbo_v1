import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { ServerError } from "./../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse, NextResponse as res } from "next/server";
import {
  ConflictError,
  ForbiddenError, // Added ForbiddenError
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  getSessionFromCookie,
  createSession,
} from "@omenai/shared-lib/auth/session";
import { cookies } from "next/headers";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { createErrorRollbarReport } from "../../../util";
import { DeletionRequestModel } from "@omenai/shared-models/models/deletion/DeletionRequestSchema";

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const data = await request.json();
      const { email, password, device_push_token } = data;

      await connectMongoDB();

      // 1. Authenticate Artist
      const artist = await AccountArtist.findOne<ArtistSchemaTypes>({
        email: email.toLowerCase(),
      }).exec();

      if (!artist) throw new ConflictError("Invalid credentials");

      const isPasswordMatch = bcrypt.compareSync(password, artist.password);
      if (!isPasswordMatch) throw new ConflictError("Invalid credentials");

      // 2. Prepare Session Payload
      const {
        artist_id,
        verified,
        name,
        role,
        isOnboardingCompleted,
        artist_verified,
        logo,
        base_currency,
        wallet_id,
        address,
        categorization,
      } = artist;

      const sessionPayload = {
        id: artist_id,
        artist_id,
        verified,
        name,
        role: role as "artist",
        email: artist.email,
        isOnboardingCompleted,
        artist_verified,
        logo,
        base_currency,
        wallet_id,
        address,
        categorization,
      };

      const userAgent: string | null =
        request.headers.get("User-Agent") || null;
      const mobileAccessKey: string | null =
        request.headers.get("X-Access-Key") || null;

      // ============================================================
      // BRANCH A: MOBILE APP LOGIN (Return JSON Token)
      // ============================================================
      if (userAgent && userAgent === process.env.MOBILE_USER_AGENT!) {
        if (
          !mobileAccessKey ||
          mobileAccessKey !== process.env.MOBILE_ACCESS_KEY
        ) {
          throw new ForbiddenError("Invalid App Credentials");
        }

        // A1. Update Push Token
        if (device_push_token) {
          await DeviceManagement.updateOne(
            { auth_id: sessionPayload.artist_id },
            { $setOnInsert: { device_push_token } },
            { upsert: true },
          );
        }

        // A2. CREATE SESSION (Redis Only)
        const sessionId = await createSession({
          userId: artist_id,
          userData: sessionPayload,
          userAgent,
        });

        // A3. RETURN JSON (With Access Token)
        return NextResponse.json(
          {
            success: true,
            message: "Login successful",
            data: {
              ...sessionPayload,
              access_token: sessionId, // <--- Mobile Token
              device_push_token,
            },
          },
          { status: 200 },
        );
      }

      try {
        await DeletionRequestModel.deleteOne({
          targetId: artist.artist_id,
          gracePeriodUntil: { $gt: toUTCDate(new Date()) },
        });
      } catch (error) {
        createErrorRollbarReport(
          "Auth - Artist: Deletion request removal failed",
          error,
          500,
        );
      }

      const cookieStore = await cookies();
      const session = await getSessionFromCookie(cookieStore);

      const sessionId = await createSession({
        userId: artist_id,
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
        { status: 200 },
      );
    } catch (error: any) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "auth: artist login",
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
