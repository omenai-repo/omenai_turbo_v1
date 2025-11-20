import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  NotFoundError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { createErrorRollbarReport } from "../../../util";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist_id = searchParams.get("id");

  try {
    if (!artist_id || typeof artist_id !== "string")
      throw new BadRequestError("Invalid ID parameter provided");
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
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artist: fetch profile",
      error as any,
      error_response.status
    );
    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
