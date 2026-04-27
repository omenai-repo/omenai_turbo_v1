import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import z from "zod";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { toggleEventVisibility } from "../../../../services/gallery/events/toggleEventVisibility.service";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};
const eventMetricsAnalyticsSchema = z.object({
  eventId: z.string(),
  galleryId: z.string(),
  targetStatus: z.boolean(),
});
export const PATCH = withRateLimitHighlightAndCsrf(config)(async function PATCH(
  req: Request,
) {
  try {
    const body = await req.json();
    const { eventId, galleryId, targetStatus } =
      eventMetricsAnalyticsSchema.parse(body);

    if (!eventId || !galleryId || targetStatus === undefined) {
      return NextResponse.json(
        { isOk: false, message: "Missing required fields" },
        { status: 400 },
      );
    }
    await connectMongoDB();

    // 2. Execute Archive & Teardown
    const result = await toggleEventVisibility(
      eventId,
      galleryId,
      targetStatus,
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API Error - Archive Programming:", error);
    return NextResponse.json(
      { isOk: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
