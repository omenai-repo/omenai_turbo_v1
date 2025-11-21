import {
  lenientRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountAdmin } from "@omenai/shared-models/models/auth/AccountAdmin";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { createErrorRollbarReport } from "../../util";

export const GET = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function GET() {
    try {
      await connectMongoDB();
      const admins = await AccountAdmin.find(
        {},
        "name email access_role admin_id joinedAt verified"
      );

      return NextResponse.json(
        { message: "Successfully fetched all admins", data: admins },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "admin: fetch admins",
        error,
        error_response?.status
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
