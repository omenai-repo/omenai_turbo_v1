import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  ConflictError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Editor", "Owner", "Viewer"],
};
const UpdateAdminProfileSchema = z.object({
  name: z.string().min(1),
  admin_id: z.string().min(1),
});
export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request,
) {
  try {
    const { admin_id, name } = await validateRequestBody(
      request,
      UpdateAdminProfileSchema,
    );

    const account = await AccountAdmin.findOne({ admin_id });
    if (!account) {
      throw new BadRequestError("Admin account not found");
    }

    const updateName = await AccountAdmin.updateOne(
      { admin_id },
      { $set: { name } },
    );

    if (updateName.modifiedCount === 0)
      throw new ConflictError(
        "Something went wrong with this request, Please contact support.",
      );

    return NextResponse.json(
      { message: "Admin credentials updated successfully, please log back in" },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: update admin profile",
      error,
      error_response?.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
