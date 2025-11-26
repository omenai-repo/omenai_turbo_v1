import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { AccountAdminSchemaTypes, CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  ConflictError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import bcrypt from "bcrypt";
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
      password,
      admin_id,
      current_password,
    }: Pick<AccountAdminSchemaTypes, "password" | "admin_id"> & {
      current_password: string;
    } = await request.json();

    if (!password || !admin_id || !current_password)
      throw new BadRequestError("Update parameters required");

    const account = await AccountAdmin.findOne({ admin_id });
    if (!account) {
      throw new BadRequestError("Admin account not found");
    }

    const isOldPasswordMatch = bcrypt.compareSync(
      current_password,
      account.password
    );

    const isPasswordMatch = bcrypt.compareSync(password, account.password);

    if (!isOldPasswordMatch)
      throw new ConflictError("Current password is incorrect");

    if (isPasswordMatch)
      throw new ConflictError(
        "Your password cannot be identical to your previous password"
      );

    const hashedPassword = await hashPassword(password);

    const updatePassword = await AccountAdmin.updateOne(
      { admin_id },
      { $set: { password: hashedPassword } }
    );

    if (updatePassword.modifiedCount === 0)
      throw new ConflictError(
        "Something went wrong with this request, Please contact support."
      );

    return NextResponse.json(
      { message: "Admin credentials updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: update admin credentials",
      error,
      error_response?.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
