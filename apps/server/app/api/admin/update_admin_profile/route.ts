import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { AccountAdminSchemaTypes, CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  ConflictError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Editor", "Owner", "Viewer"],
};
export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request
) {
  try {
    const {
      name,
      admin_id,
    }: Pick<AccountAdminSchemaTypes, "name" | "admin_id"> & {
      current_password: string;
    } = await request.json();

    if (!name || !admin_id)
      throw new BadRequestError("Update parameters required");

    const account = await AccountAdmin.findOne({ admin_id });
    if (!account) {
      throw new BadRequestError("Admin account not found");
    }

    const updateName = await AccountAdmin.updateOne(
      { admin_id },
      { $set: { name } }
    );

    if (updateName.modifiedCount === 0)
      throw new ConflictError(
        "Something went wrong with this request, Please contact support."
      );

    return NextResponse.json(
      { message: "Admin credentials updated successfully, please log back in" },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: update admin profile",
      error as any,
      error_response?.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
