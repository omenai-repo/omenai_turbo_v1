import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { CombinedConfig } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { sendRoleChangeMail } from "@omenai/shared-emails/src/models/admin/sendRoleChangeMail";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};

const EditMemberRole = z.object({
  admin_id: z.string().min(1),
  role: z.string().min(1),
});

export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request,
) {
  try {
    const { admin_id, role } = await validateRequestBody(
      request,
      EditMemberRole,
    );

    await connectMongoDB();

    const admin = await AccountAdmin.findOne(
      { admin_id },
      "access_role name email",
    );

    const role_update = await AccountAdmin.updateOne(
      { admin_id },
      { $set: { access_role: role } },
    );

    if (role_update.modifiedCount === 0) {
      return NextResponse.json(
        { message: "No changes made or admin not found" },
        { status: 500 },
      );
    }
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
    createErrorRollbarReport(
      "admin: edit member role",
      error,
      error_response?.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
