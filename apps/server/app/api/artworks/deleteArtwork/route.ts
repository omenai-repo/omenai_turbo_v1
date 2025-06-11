import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();

      const { art_id } = await request.json();

      const artwork = await Artworkuploads.deleteOne({ art_id }).exec();
      if (!artwork)
        throw new ServerError(
          "Error processing request. Please try again later."
        );

      return NextResponse.json(
        {
          message: "Artwork successfully deleted",
        },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response!.message },
        { status: error_response!.status }
      );
    }
  }
);
