import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  AccountAdminSchemaTypes,
  AdminAccessRoleTypes,
} from "@omenai/shared-types";
import bcrypt from "bcrypt";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { NextResponse, NextResponse as res } from "next/server";
import {
  ConflictError,
  ForbiddenError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  getSessionFromCookie,
  createSession,
} from "@omenai/shared-lib/auth/session";
import { cookies } from "next/headers";
import { access } from "fs-extra";
import { createErrorRollbarReport } from "../../../util";
export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      const cookieStore = await cookies();

      const data = await request.json();

      const { email, password } = data;

      await connectMongoDB();

      const user = await AccountAdmin.findOne<AccountAdminSchemaTypes>({
        email,
      }).exec();

      if (!user) throw new ConflictError("Invalid credentials");

      if (!user.verified)
        throw new ForbiddenError(
          "Please activate your admin account to proceed."
        );

      const isPasswordMatch = bcrypt.compareSync(password, user.password);

      if (!isPasswordMatch) throw new ConflictError("Invalid credentials");
      const session_payload = {
        name: user.name,
        email: user.email,
        id: user.admin_id,
        role: user.role as "admin",
        admin_id: user.admin_id,
        access_role: user.access_role,
        verified: user.verified,
        admin_active: user.admin_active,
        joinedAt: user.joinedAt,
      };
      const userAgent: string | null =
        request.headers.get("User-Agent") || null;
      const session = await getSessionFromCookie(cookieStore);

      const sessionId = await createSession({
        userId: user.admin_id,
        userData: session_payload,
        userAgent,
      });

      session.sessionId = sessionId;

      await session.save();

      return res.json(
        {
          message: "Login successful",
          data: session_payload,
        },
        { status: 200 }
      );
    } catch (error: any) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "auth: admin login",
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
