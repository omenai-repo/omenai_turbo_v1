import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const GET = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function GET() {
    try {
      await connectMongoDB();
      const artists = await AccountArtist.find(
        { isOnboardingCompleted: true },
        "name logo email artist_verified artist_id"
      );

      if (!artists)
        throw new ServerError("Something went wrong, contact tech team");

      return NextResponse.json(
        { message: "Data retrieved", data: artists },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
