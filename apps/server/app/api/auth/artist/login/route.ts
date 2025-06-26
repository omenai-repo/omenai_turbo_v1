import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse, NextResponse as res } from "next/server";
import { ConflictError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  getSessionFromCookie,
  createSession,
} from "@omenai/shared-lib/auth/session";
import { cookies } from "next/headers";

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const data = await request.json();

      const { email, password } = data;

      await connectMongoDB();

      const artist = await AccountArtist.findOne<ArtistSchemaTypes>({
        email,
      }).exec();

      if (!artist) throw new ConflictError("Invalid credentials");

      const isPasswordMatch = bcrypt.compareSync(password, artist.password);

      if (!isPasswordMatch) throw new ConflictError("Invalid credentials");
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
      const authorization: string | null =
        request.headers.get("Authorization") || null;

      if (userAgent && userAgent === "__X-Omenai-App") {
        if (
          authorization &&
          authorization === process.env.APP_AUTHORIZATION_SECRET
        ) {
          return NextResponse.json(
            {
              success: true,
              message: "Login successful",
              data: sessionPayload,
            },
            { status: 200 }
          );
        }
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
        { status: 200 }
      );
    } catch (error: any) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
