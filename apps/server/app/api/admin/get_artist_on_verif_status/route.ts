import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";

export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const { status } = await request.json();
    const artists = await AccountArtist.find(
      { artist_verified: status, verified: true },
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
