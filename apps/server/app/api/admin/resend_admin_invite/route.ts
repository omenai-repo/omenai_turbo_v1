import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { CombinedConfig } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";
import { sendMemberInviteEmail } from "@omenai/shared-emails/src/models/admin/sendMemberInviteEmail";
import { createErrorRollbarReport } from "../../util";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  const { admin_id } = await request.json();
  try {
    if (!admin_id) throw new BadRequestError("ID is required");

    if (typeof admin_id !== "string") {
      throw new BadRequestError("Invalid admin_id format");
    }

    await connectMongoDB();

    const is_member_exist = await AccountAdmin.findOne({ admin_id }, "email");

    if (!is_member_exist || is_member_exist.verified)
      throw new ForbiddenError("Invalid operation, cannot process.");

    const is_token_exist = await AdminInviteToken.findOne({
      author: is_member_exist.email,
    });

    if (is_token_exist)
      throw new BadRequestError(
        "Invitation link still active for this member."
      );

    const token = generateAlphaDigit(32);

    await AdminInviteToken.create({
      author: is_member_exist.email,
      token,
    });

    sendMemberInviteEmail({ email: is_member_exist.email, token });

    return NextResponse.json(
      { message: "Invite resent successfully" },
      { status: 201 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: resend admin invite",
      error,
      error_response?.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
