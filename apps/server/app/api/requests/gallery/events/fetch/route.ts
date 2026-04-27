import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { fetchGalleryEvents } from "../../../../services/gallery/events/fetchGalleryEvents.service";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};
export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  req: Request,
) {
  try {
    // 1. Get the gallery_id from the query parameters
    const { searchParams } = new URL(req.url);
    const galleryId = searchParams.get("gallery_id");

    if (!galleryId) {
      return NextResponse.json(
        { isOk: false, message: "Gallery ID is required" },
        { status: 400 },
      );
    }

    await connectMongoDB();
    // 3. Fetch data
    const result = await fetchGalleryEvents(galleryId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API Error - Fetch Programming:", error);
    return NextResponse.json(
      { isOk: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
