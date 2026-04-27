import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { archiveEvent } from "../../../../services/gallery/events/archiveEvent";
import { updateEventDetails } from "../../../../services/gallery/events/updateEventDetails.service";
const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};
export const PATCH = withRateLimitHighlightAndCsrf(config)(async function PATCH(
  req: Request,
) {
  try {
    const body = await req.json();
    const { event_id, gallery_id, update_data } = body;

    if (!event_id || !gallery_id) {
      return NextResponse.json(
        { isOk: false, message: "Missing required fields" },
        { status: 400 },
      );
    }
    await connectMongoDB();

    // 2. Execute Archive & Teardown
    const result = await updateEventDetails(event_id, gallery_id, update_data);

    if (!result.isOk) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API Error - Archive Programming:", error);
    return NextResponse.json(
      { isOk: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
