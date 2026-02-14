import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "zod";

const FetchArtistVerifInfoSchema = z.object({
  artist_id: z.string().min(1),
});

export const GET = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function GET(request: Request) {
    const searchParam = new URL(request.url).searchParams;
    const id = searchParam.get("id");

    try {
      const { artist_id } = validateGetRouteParams(FetchArtistVerifInfoSchema, {
        artist_id: id,
      });

      await connectMongoDB();
      const artist = await AccountArtist.findOne(
        { artist_id },
        "name logo email documentation artist_id art_style logo address",
      );

      const verif_req = await ArtistCategorization.findOne(
        { artist_id },
        "request",
      );

      if (!artist || !verif_req)
        throw new ServerError("Something went wrong, contact tech team");

      const response_data = { artist, request: verif_req.request };
      return NextResponse.json(
        { message: "Data retrieved", data: response_data },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "admin: fetch artist verify info",
        error,
        error_response?.status,
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }
  },
);
