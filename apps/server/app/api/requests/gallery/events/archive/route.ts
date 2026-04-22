import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { archiveEvent } from "../../../../services/gallery/events/archiveEvent";
const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { event_id, gallery_id } = body;

    if (!event_id || !gallery_id) {
      return NextResponse.json(
        { isOk: false, message: "Missing required fields" },
        { status: 400 },
      );
    }
    await connectMongoDB();

    // 2. Execute Archive & Teardown
    const result = await archiveEvent(event_id, gallery_id);

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
