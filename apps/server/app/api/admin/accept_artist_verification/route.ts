import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { sendArtistAcceptedMail } from "@omenai/shared-emails/src/models/artist/sendArtistAcceptedMail";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const { artist_id, name, email } = await request.json();

    const verify_artist = await AccountArtist.updateOne(
      { artist_id },
      { $set: { artist_verified: true } }
    );

    if (!verify_artist) throw new ServerError("Something went wrong");

    // TODO: Send mail to Artist
    sendArtistAcceptedMail({
      name,
      email,
    });

    return NextResponse.json(
      { message: "Artist verification accepted" },
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
