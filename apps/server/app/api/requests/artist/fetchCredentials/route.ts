import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import { NotFoundError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import {
  createErrorRollbarReport,
  validateGetRouteParams,
} from "../../../util";
import z from "zod";
const FetchCredentialsSchema = z.object({
  artist_id: z.string(),
});
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  try {
    await connectMongoDB();
    const { artist_id } = validateGetRouteParams(FetchCredentialsSchema, {
      artist_id: id,
    });
    const credentials = await ArtistCategorization.findOne(
      { artist_id },
      "current",
    );

    if (!credentials)
      throw new NotFoundError(
        "No credentials were found for this artist id. Try again or contact support",
      );

    const artist_data = await AccountArtist.findOne(
      { artist_id },
      "documentation",
    );
    return NextResponse.json(
      {
        message: "Credentials retrieved successfully",
        credentials: credentials.current,
        documentation: artist_data.documentation,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artist: fetch credentials",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
}
