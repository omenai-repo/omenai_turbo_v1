import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { FailedPickup } from "@omenai/shared-models/models/crons/FailedPickup";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { CombinedConfig } from "@omenai/shared-types";
const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  req: Request,
) {
  try {
    await connectMongoDB();
    const { order_id } = await req.json();

    await FailedPickup.updateOne(
      { order_id },
      {
        $set: {
          status: "resolved",
          error_message: "Resolved manually by Admin",
        },
      },
    );

    return NextResponse.json({ success: true, message: "Marked as resolved" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
});
