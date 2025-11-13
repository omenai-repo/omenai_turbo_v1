import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { CombinedConfig } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { sendRoleChangeMail } from "@omenai/shared-emails/src/models/admin/sendRoleChangeMail";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};

export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request
) {
  try {
    const { admin_id, role } = await request.json();
    if (!admin_id) throw new BadRequestError('"Admin ID is required"');

    await connectMongoDB();

    const admin = await AccountAdmin.findOne(
      { admin_id },
      "access_role name email"
    );

    const role_update = await AccountAdmin.updateOne(
      { admin_id },
      { $set: { access_role: role } }
    );

    if (role_update.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes made or admin not found" },
        { status: 500 }
      );
    }
    // TODO: Send email notification to user informing them their member role has changed
    await sendRoleChangeMail({
      name: admin.name,
      previousRole: admin.access_role,
      newRole: role,
      email: admin.email,
    });
    return NextResponse.json({
      message: "Team member role updated successfully",
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
