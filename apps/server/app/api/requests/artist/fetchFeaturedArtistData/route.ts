import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  createErrorRollbarReport,
  validateGetRouteParams,
} from "../../../util";
import z from "zod";
const FetchFeaturedArtistSchema = z.object({
  artist_id: z.string(),
});
export const GET = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const id = searchParams.get("id");
    // const page = searchParams.get("page") || 1;

    try {
      await connectMongoDB();
      const { artist_id } = validateGetRouteParams(FetchFeaturedArtistSchema, {
        artist_id: id,
      });
      const artist_data = await AccountArtist.findOne(
        { artist_id },
        "logo name bio documentation address",
      );

      if (!artist_data || artist_data.length === 0) {
        return NextResponse.json(
          { message: "Artist not found" },
          { status: 404 },
        );
      }
      const artworksForArtist = await Artworkuploads.find({
        author_id: artist_id,
      })

        .exec();

      return NextResponse.json({
        message: "Featured artist data fetched",
        data: artist_data,
        artist_artworks: artworksForArtist,
      });
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "artist: fetch Featured Artist data",
        error,
        error_response.status,
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }
  },
);
