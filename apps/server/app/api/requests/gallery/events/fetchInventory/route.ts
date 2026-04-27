import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { fetchAvailableInventory } from "../../../../services/gallery/events/fetchGalleryArtworkInventory.service";

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
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const searchTerm = searchParams.get("search_term") || ""; // Default to empty string

    if (!galleryId) {
      return NextResponse.json(
        { isOk: false, message: "Gallery ID is required" },
        { status: 400 },
      );
    }

    // 2. Safely parse pagination numbers with fallbacks
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    await connectMongoDB();

    // 3. Fetch data with new pagination and search arguments
    const result = await fetchAvailableInventory(
      galleryId,
      page,
      limit,
      searchTerm,
    );

    // 4. Return data AND the pagination object for the frontend
    return NextResponse.json(
      {
        isOk: result.isOk,
        data: result.data,
        pagination: result.pagination,
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
