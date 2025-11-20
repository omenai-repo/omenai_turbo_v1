import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { fetchArtworksFromCache } from "../utils";
import { createErrorRollbarReport } from "../../util";

export const POST = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { id } = await request.json();

      const allArtworksIds = await Artworkuploads.find({
        author_id: id,
      })
        .sort({ createdAt: -1 })
        .select("art_id")
        .lean()
        .exec();

      const artIds = allArtworksIds.map((a) => a.art_id);

      const allArtworks = await fetchArtworksFromCache(artIds);

      return NextResponse.json(
        {
          message: "Successful",
          data: allArtworks,
          count: allArtworks.length,
        },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "artwork: get All Artwork by id",
        error as any,
        error_response?.status
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
