import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { sendArtistAcceptedMail } from "@omenai/shared-emails/src/models/artist/sendArtistAcceptedMail";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
export async function POST(request: Request) {
  const client = await connectMongoDB();
  const session = await client.startSession();
  session.startTransaction();
  try {
    const { artist_id } = await request.json();

    if (!artist_id)
      throw new BadRequestError("Invalid Parameters - Artist ID is required");

    const get_artist = await AccountArtist.findOne(
      { artist_id },
      "name, email"
    );
    const get_artist_categorization = await ArtistCategorization.findOne(
      { artist_id },
      "request history"
    );
    if (!artist_id || !get_artist_categorization)
      throw new NotFoundError("Artist not found for the given artist ID");

    try {
      const request_history =
        get_artist_categorization.history === null
          ? []
          : get_artist_categorization.history;

      const categorizationRequestUpdate = {
        history: [...request_history, get_artist_categorization.request],
        current: {
          date: new Date(),
          categorization: get_artist_categorization.request.categorization,
        },
        request: null,
      };

      const update_artist_categorization = await ArtistCategorization.updateOne(
        { artist_id },
        { $set: { ...categorizationRequestUpdate } }
      );
      const update_artist_acc = await AccountArtist.updateOne(
        { artist_id },
        { $set: { artist_verified: true } }
      );

      const [accept_artist_verif_result] = await Promise.all([
        update_artist_categorization,
        update_artist_acc,
      ]);

      if (!accept_artist_verif_result.acknowledged)
        throw new ServerError(
          "Artist verification not successful. Please contact IT support"
        );

      session.commitTransaction();

      // TODO: Send mail to Artist
      sendArtistAcceptedMail({
        name: get_artist.name,
        email: get_artist.email,
      });
      return NextResponse.json(
        { message: "Artist verification accepted" },
        { status: 200 }
      );
    } catch (error) {
      session.abortTransaction();
      console.log(error);
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);
    session.abortTransaction();
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
