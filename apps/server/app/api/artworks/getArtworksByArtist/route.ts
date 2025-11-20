import { artist } from "./../../../../../admin/app/layout/navMockData";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { fetchArtworksFromCache, getCachedGalleryIds } from "../utils";
import { createErrorRollbarReport } from "../../util";

export const POST = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function POST(request: Request) {
    const PAGE_SIZE = 30;
    try {
      await connectMongoDB();
      const { page = 1, artist } = await request.json();
      const skip = (page - 1) * PAGE_SIZE;

      const galleries = await getCachedGalleryIds();

      // Fetch all filtered artworks, sorted by creation date

      const allArtworksIds = await Artworkuploads.find({
        $or: [
          { "role_access.role": "artist" },
          { "role_access.role": "gallery", author_id: { $in: [...galleries] } },
        ],
        artist,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .select("art_id")
        .lean()
        .exec();

      const artIds = allArtworksIds.map((a) => a.art_id);

      const allArtworks = await fetchArtworksFromCache(artIds);

      return NextResponse.json(
        {
          message: "Successful",
          data: allArtworks,
        },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "artwork: get Artwork by artist",
        error as any,
        error_response.status
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
