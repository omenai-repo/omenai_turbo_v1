import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { id, url } = await request.json();

    const updateLogo = await AccountArtist.updateOne(
      { artist_id: id },
      { $set: { logo: url } }
    );

    if (updateLogo.modifiedCount === 0)
      throw new ServerError(
        "Error updating logo. Please try again or contact support"
      );

    return NextResponse.json(
      {
        message: "Logo updated",
      },
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
