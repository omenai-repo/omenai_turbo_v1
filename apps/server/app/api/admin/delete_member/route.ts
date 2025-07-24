import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { CombinedConfig } from "@omenai/shared-types";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["admin", "owner"],
};

export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request
) {
  try {
    const { admin_id } = await request.json();
    if (!admin_id) {
      throw new BadRequestError("Admin ID is required");
    }
    await connectMongoDB();
    const user_delete = await AccountAdmin.deleteOne({ admin_id });
    if (user_delete.deletedCount === 0)
      throw new ServerError(
        "Deletion could not be completed, please try again or contact support."
      );
    return NextResponse.json(
      {
        message: "Team member deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
