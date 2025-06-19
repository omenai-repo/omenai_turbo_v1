import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  ConflictError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { clerkClient } from "@clerk/nextjs/server";

// SERVER SIDE - Generate a sign-in token/ticket
export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const { email, password } = await request.json();
      await connectMongoDB();

      // 1. Your existing authentication logic
      const user = await AccountIndividual.findOne<IndividualSchemaTypes>({
        email,
      }).exec();
      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new ConflictError("Invalid credentials");
      }

      const sessionPayload = {
        id: user.user_id,
        name: user.name,
        preferences: user.preferences,
        address: user.address,
        role: user.role,
        email: user.email,
        verified: user.verified,
      };

      const userAgent: string | null =
        request.headers.get("User-Agent") || null;
      const authorization: string | null =
        request.headers.get("Authorization") || null;

      console.log(userAgent, authorization);

      if (userAgent && userAgent === "__X-Omenai-App") {
        console.log("App user agent detected");
        if (
          authorization &&
          authorization === process.env.APP_AUTHORIZATION_SECRET
        ) {
          console.log("App authorization successful");
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

      console.log("No Web user agent detected or no app authorization");

      const client = await clerkClient();
      let clerkUserId = user.clerkUserId;
      let clerkUser = null;

      // First, ensure we have a valid clerkUserId
      if (!clerkUserId) {
        const existingClerkUsers = await client.users.getUserList({
          emailAddress: [user.email],
        });
        if (existingClerkUsers.data.length > 0) {
          clerkUser = existingClerkUsers.data[0];
          clerkUserId = clerkUser.id;
          await AccountIndividual.updateOne(
            { email },
            { $set: { clerkUserId } }
          );
        } else {
          const newClerkUser = await client.users.createUser({
            emailAddress: [email],
            externalId: user.user_id.toString(),
            skipPasswordRequirement: true,
          });
          clerkUserId = newClerkUser.id;
          clerkUser = newClerkUser;
          await AccountIndividual.updateOne(
            { email },
            { $set: { clerkUserId } }
          );
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
            currentMetadata.role !== user.role
          ) {
            console.log(
              `Revoked ${revokedCount} sessions for user ${clerkUserId} switching from ${currentMetadata.role} to ${user.role}`
            );
          } else {
            console.log(
              `Revoked ${revokedCount} sessions for user ${clerkUserId} logging into ${user.role} role`
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
      const errorResponse = handleErrorEdgeCases(error);
      console.log(error);
      return NextResponse.json(
        { message: errorResponse?.message },
        { status: errorResponse?.status }
      );
    }
  }
);
