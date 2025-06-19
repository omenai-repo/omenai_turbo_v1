import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse, NextResponse as res } from "next/server";
import { ConflictError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { clerkClient } from "@clerk/nextjs/server";

export const POST = withRateLimitAndHighlight(strictRateLimit)(
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
        phone,
        categorization,
      } = artist;

      const sessionPayload = {
        id: artist_id,
        artist_id,
        verified,
        name,
        role,
        email: artist.email,
        isOnboardingCompleted,
        artist_verified,
        logo,
        base_currency,
        wallet_id,
        address,
        phone,
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

      const client = await clerkClient();
      let clerkUserId = artist.clerkUserId;
      let clerkUser = null;

      // First, ensure we have a valid clerkUserId
      if (!clerkUserId) {
        const existingClerkUsers = await client.users.getUserList({
          emailAddress: [email],
        });
        if (existingClerkUsers.data.length > 0) {
          clerkUser = existingClerkUsers.data[0];
          clerkUserId = clerkUser.id;
          await AccountArtist.updateOne({ email }, { $set: { clerkUserId } });
        } else {
          const newClerkUser = await client.users.createUser({
            emailAddress: [email],
            externalId: artist.artist_id.toString(),
            skipPasswordRequirement: true,
          });
          clerkUserId = newClerkUser.id;
          clerkUser = newClerkUser;
          await AccountArtist.updateOne({ email }, { $set: { clerkUserId } });
        }
      } else {
        // User already has clerkUserId, fetch their current data
        try {
          clerkUser = await client.users.getUser(clerkUserId);
        } catch (error) {
          console.error(`Error fetching Clerk user ${clerkUserId}:`, error);
          // Handle case where clerkUserId exists but user doesn't exist in Clerk
          // This could happen if the Clerk user was deleted but your DB still has the ID
          throw new Error("User session invalid. Please try logging in again.");
        }
      }

      // Always revoke existing sessions before creating new sign-in token
      if (clerkUser) {
        const currentMetadata = clerkUser.publicMetadata as any;

        console.log("currentMetadata:", currentMetadata);

        try {
          console.log(
            "Revoking existing sessions for user before creating new sign-in token:",
            clerkUserId
          );
          const userSessions = await client.sessions.getSessionList({
            userId: clerkUserId,
          });

          console.log("Found sessions:", userSessions.data.length);

          // Revoke all active sessions
          let revokedCount = 0;
          for (const session of userSessions.data) {
            if (session.status === "active") {
              await client.sessions.revokeSession(session.id);
              revokedCount++;
            }
          }

          if (
            currentMetadata &&
            currentMetadata.role &&
            currentMetadata.role !== role
          ) {
            console.log(
              `Revoked ${revokedCount} sessions for user ${clerkUserId} switching from ${currentMetadata.role} to ${role}`
            );
          } else {
            console.log(
              `Revoked ${revokedCount} sessions for user ${clerkUserId} logging into ${role} role`
            );
          }
        } catch (sessionError) {
          console.error("Error revoking existing sessions:", sessionError);
          // Continue with login process even if session revocation fails
        }
      }

      // 3. Update Clerk metadata
      await client.users.updateUser(clerkUserId, {
        publicMetadata: { ...sessionPayload },
      });

      // 4. Create a sign-in ticket/token instead of a session
      const signInToken = await client.signInTokens.createSignInToken({
        userId: clerkUserId,
        expiresInSeconds: 3600, // 1hr
      });

      return NextResponse.json(
        {
          success: true,
          message: "Login successful",
          data: sessionPayload,
          signInToken: signInToken.token, // This is what the client needs
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
