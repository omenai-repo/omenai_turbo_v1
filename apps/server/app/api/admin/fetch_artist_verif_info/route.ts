import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";

export const GET = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function GET(request: Request) {
    const searchParam = new URL(request.url).searchParams;
    const id = searchParam.get("id");

    try {
      if (!id) throw new BadRequestError("Missing url parameter - ID");

      await connectMongoDB();
      const artist = await AccountArtist.findOne(
        { artist_id: id },
        "name logo email documentation artist_id art_style logo address"
      );

      const verif_req = await ArtistCategorization.findOne(
        { artist_id: id },
        "request"
      );

      if (!artist || !verif_req)
        throw new ServerError("Something went wrong, contact tech team");

      const response_data = { artist, request: verif_req.request };
      return NextResponse.json(
        { message: "Data retrieved", data: response_data },
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
