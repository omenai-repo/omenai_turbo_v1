import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import Server from "next/dist/server/base-server";
import {
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { AdminInviteToken } from "@omenai/shared-models/models/auth/verification/AdminInviteTokenSchema";

const config: CombinedConfig = {
  ...strictRateLimit,
};
export const POST = withRateLimit(config)(async function POST(
  request: Request
) {
  try {
    const { name, password, token, email } = await request.json();

    if (!name || !password || !token || !email)
      throw new ServerError("Missing required fields");

    await connectMongoDB();

    const existingAdmin = await AccountAdmin.findOne({ email }, "email");

    if (!existingAdmin || existingAdmin.email !== email)
      throw new ForbiddenError("Unauthorized access to resource");
    const existing_token = await AdminInviteToken.findOne({ author: email });

    if (!existing_token) throw new ForbiddenError("Invalid invitation code");

    const hashedPassword = await hashPassword(password);

    const date = new Date();
    const activate_admin_user = await AccountAdmin.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          name,
          verified: true,
          admin_active: true,
          joinedAt: date,
        },
      }
    );

    if (activate_admin_user.modifiedCount === 0)
      throw new ServerError("Activation failed, please contact support");

    await AdminInviteToken.deleteOne({ token });

    //TODO: Send email notification about account activation

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
