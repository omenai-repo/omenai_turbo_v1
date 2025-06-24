import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

export const GET = withRateLimitAndHighlight(lenientRateLimit)(
  async function GET(request: Request) {
    try {
      await connectMongoDB();
      const artists = await AccountArtist.find({}, "logo name artist_id").limit(
        10
      );

      return NextResponse.json({
        message: "Featured artists fetched",
        data: artists,
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
