import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { BadRequestError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
export const GET = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const artist_id = searchParams.get("id");
    const page = searchParams.get("page") || 1;

    try {
      await connectMongoDB();
      if (isNaN(Number(page))) throw new BadRequestError("Invalid page number");

      const skip = (Number(page) - 1) * 20;

      const artist_data = await AccountArtist.find(
        { artist_id },
        "logo name bio"
      );

      if (!artist_data || artist_data.length === 0) {
        return NextResponse.json(
          { message: "Artist not found" },
          { status: 404 }
        );
      }
      const artworksForArtist = await Artworkuploads.find(
        { author_id: artist_id },
        "art_id title url artist"
      )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(20)
        .exec();

      return NextResponse.json({
        message: "Featured artist data fetched",
        data: artist_data,
        artist_artworks: artworksForArtist,
      });
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
