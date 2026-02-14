import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { CombinedConfig } from "@omenai/shared-types";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};

const DeleteMemberSchema = z.object({
  admin_id: z.string().min(1),
  email: z.email(),
});

export const PUT = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request,
) {
  try {
    const { admin_id, email } = await validateRequestBody(
      request,
      DeleteMemberSchema,
    );
    await connectMongoDB();

    await AdminInviteToken.deleteOne({ author: email });

    const user_delete = await AccountAdmin.deleteOne({ admin_id });

    if (user_delete.deletedCount === 0)
      throw new ServerError(
        "Deletion could not be completed, please try again or contact support.",
      );
    return NextResponse.json(
      {
        message: "Team member deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: delete member",
      error,
      error_response?.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
