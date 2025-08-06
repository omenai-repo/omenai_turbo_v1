import { sendMemberInviteEmail } from "@omenai/shared-emails/src/models/admin/sendMemberInviteEmail";
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
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
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

    const client = await connectMongoDB();

    const session = await client.startSession();

    const is_member_exist = await AccountAdmin.findOne({ email });

    if (is_member_exist)
      throw new ForbiddenError(
        "This email is already associated to a team member"
      );

    const token = generateAlphaDigit(32);
    try {
      session.startTransaction();
      const create_new_member = await AccountAdmin.create({
        email,
        access_role,
      });

      await AdminInviteToken.create({
        author: email,
        token,
      });

      session.commitTransaction();
    } catch (error) {
      session.abortTransaction();

      throw new ServerError(
        "Unable to process this request. Please contact IT support"
      );
    }

    // TODO: Convert this into a transaction

    await sendMemberInviteEmail({ email, token });

    return NextResponse.json(
      { message: "Invite sent successfully" },
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
