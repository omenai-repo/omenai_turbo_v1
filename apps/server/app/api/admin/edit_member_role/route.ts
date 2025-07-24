import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { CombinedConfig } from "@omenai/shared-types";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["admin", "owner"],
};

export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request
) {
  try {
    const { admin_id, role } = await request.json();
    if (!admin_id) throw new BadRequestError('"Admin ID is required"');

    await connectMongoDB();
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
    // todo: Send email notification about role change
    return NextResponse.json({
      message: "This endpoint is not implemented yet",
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
