import { ServerError } from "./../../../../../custom/errors/dictionary/errorDictionary";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CombinedConfig, SessionData } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { getEngagementMetrics } from "@omenai/shared-lib/analytics/getEngagementMetrics";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Owner", "Admin"],
};

export const GET = withRateLimitHighlightAndCsrf(config)(async function GET() {
  try {
    // 1. Establish database connection
    await connectMongoDB();

    // 2. Execute our Phase 4 aggregation service
    const metrics = await getEngagementMetrics();

    if (!metrics.success) {
      throw new ServerError("Failed to calculate Engagement metrics");
    }

    // 3. Return the payload safely to the authorized admin
    return NextResponse.json(
      {
        message: "Engagement metrics retrieved successfully",
        data: metrics.data,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    // Log the failure to Rollbar for backend monitoring
    createErrorRollbarReport(
      "admin metrics: fetch Engagement data",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
