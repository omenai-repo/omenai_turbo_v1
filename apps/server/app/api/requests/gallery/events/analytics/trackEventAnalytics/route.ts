import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { trackEventMetric } from "../../../../../services/gallery/events/analytics/trackEventAnalytics.service";
import z from "zod";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

const eventMetricsAnalyticsSchema = z.object({
  event_id: z.string(),
  metric: z.enum(["views", "view_in_room", "shares"]),
});
export const POST = withRateLimit(standardRateLimit)(async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { event_id, metric } = eventMetricsAnalyticsSchema.parse(body);

    if (!event_id || !metric) {
      return NextResponse.json(
        { isOk: false, message: "Missing required fields" },
        { status: 400 },
      );
    }
    await connectMongoDB();

    // 2. Execute Archive & Teardown
    const result = await trackEventMetric(event_id, metric);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API Error - Archive Programming:", error);
    return NextResponse.json(
      { isOk: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
