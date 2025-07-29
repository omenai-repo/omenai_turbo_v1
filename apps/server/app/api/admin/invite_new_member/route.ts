import { sendMemberInviteEmail } from "@omenai/shared-emails/src/models/admin/sendMemberInviteEmail";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { CombinedConfig } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["admin", "owner"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  const { email, access_role } = await request.json();
  try {
    if (!email) throw new BadRequestError("Email is required");
    if (typeof email !== "string" || !email.includes("@")) {
      throw new BadRequestError("Invalid email format");
    }

    await connectMongoDB();
    // Here you would typically handle the logic to invite a new member
    const create_new_member = await AccountAdmin.create({
      email,
      access_role,
    });

    if (!create_new_member) {
      throw new ServerError(
        "Failed to create new member, please try again or contact support."
      );
    }

    const token = generateAlphaDigit(32);

    await AdminInviteToken.create({
      author: email,
      token,
    });

    // TODO: Convert this into a transaction

    sendMemberInviteEmail({ email, token });

    return NextResponse.json(
      { message: "New member invited successfully" },
      { status: 201 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
