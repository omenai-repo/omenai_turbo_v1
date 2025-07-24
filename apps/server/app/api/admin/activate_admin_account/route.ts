import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import Server from "next/dist/server/base-server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["admin", "owner", "editor", "viewer"],
};
export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request
) {
  try {
    const { name, password, admin_id } = await request.json();
    await connectMongoDB();
    const hashedPassword = hashPassword(password);
    const activate_admin_user = await AccountAdmin.updateOne(
      { admin_id },
      { $set: { password: hashedPassword, name, verified: true } }
    );

    if (activate_admin_user.modifiedCount === 0)
      throw new ServerError(
        "Activation failed or no changes made, please contact support"
      );

    // Send email notification about account activation
    return NextResponse.json({
      message:
        "Account successfully activated, please login with your new credentials",
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
