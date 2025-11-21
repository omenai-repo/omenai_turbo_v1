import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { fetchArtworksFromCache } from "../utils";
import { createErrorRollbarReport } from "../../util";

export const POST = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { page } = await request.json();

      const skip = (page - 1) * 10;

      const allArtworksIds = await Artworkuploads.find()
        .skip(skip)
        .limit(16)
        .select("art_id")
        .sort({
          createdAt: -1,
        })
        .lean()
        .exec();

      const artIds = allArtworksIds.map((a) => a.art_id);

      const allArtworks = await fetchArtworksFromCache(artIds);

      if (!allArtworks) throw new ServerError("An error was encountered");

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
        "artwork: get All Artwork",
        error,
        error_response?.status
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
