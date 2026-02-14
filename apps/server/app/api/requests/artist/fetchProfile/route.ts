import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NotFoundError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import {
  createErrorRollbarReport,
  validateGetRouteParams,
} from "../../../util";
import z from "zod";
const FetchProfileSchema = z.object({
  artist_id: z.string(),
});
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  try {
    const { artist_id } = validateGetRouteParams(FetchProfileSchema, {
      artist_id: id,
    });
    await connectMongoDB();

    const artist = await AccountArtist.findOne<ArtistSchemaTypes>({
      artist_id,
    }).exec();

    if (!artist) throw new NotFoundError("Artist not found");

    const { name, logo, address, email, bio } = artist;

    const payload = {
      name,
      logo,
      email,
      address,
      bio,
    };
    return NextResponse.json(
      {
        message: "Profile retrieved successfully",
        artist: payload,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artist: fetch profile",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
}
