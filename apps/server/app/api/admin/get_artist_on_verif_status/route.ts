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
  async function GET(request: Request) {
    const urlParam = new URL(request.url);
    const searchParam = urlParam.searchParams;
    try {
      const status = searchParam.get("status");

      if (!status) throw new BadRequestError("Invalid parameter - status");

      const status_bool: boolean = status === "true" ? true : false;

      await connectMongoDB();
      const artists = await AccountArtist.find(
        { artist_verified: status_bool, verified: true },
        "name address logo email artist_verified artist_id status"
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
