import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { fetchAvailableInventory } from "../../../../services/gallery/events/fetchGalleryArtworkInventory.service";
import { fetchEventDashboardData } from "../../../../services/gallery/events/fetchEventDashboardData.service";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};

export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Extract parameters
    const galleryId = searchParams.get("gallery_id");
    const event_id = searchParams.get("event_id");

    if (!galleryId || !event_id) {
      return NextResponse.json(
        { isOk: false, message: "Gallery ID and Event ID are required" },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // 3. Fetch data with new pagination and search arguments
    const result = await fetchEventDashboardData(event_id, galleryId);

    // 4. Return data AND the pagination object for the frontend
    return NextResponse.json(
      {
        isOk: result.isOk,
        data: result.data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("API Error - Fetch Available Inventory:", error);
    return NextResponse.json(
      { isOk: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
