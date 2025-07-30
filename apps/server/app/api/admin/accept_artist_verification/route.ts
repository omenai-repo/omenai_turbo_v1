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
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  const client = await connectMongoDB();
  const session = await client.startSession();
  try {
    const { artist_id, recommendation } = await request.json();

    if (!artist_id)
      throw new BadRequestError("Invalid Parameters - Artist ID is required");

    const get_artist = await AccountArtist.findOne(
      { artist_id },
      "name, email base_currency"
    );
    const get_artist_categorization = await ArtistCategorization.findOne(
      { artist_id },
      "request history id"
    );
    if (!artist_id || !get_artist_categorization)
      throw new NotFoundError("Artist not found for the given artist ID");

    const request_history =
      get_artist_categorization.history === null
        ? []
        : get_artist_categorization.history;

    const categorizationRequestUpdate = {
      history: [
        ...request_history,
        {
          ...get_artist_categorization.request,
          categorization: {
            ...get_artist_categorization.request.categorization,
            artist_categorization:
              recommendation ||
              get_artist_categorization.request.categorization
                .artist_categorization,
          },
        },
      ],
      current: {
        date: new Date(),
        categorization: {
          ...get_artist_categorization.request.categorization,
          artist_categorization:
            recommendation ||
            get_artist_categorization.request.categorization
              .artist_categorization,
        },
      },
      request: null,
    };

    try {
      session.startTransaction();
      const update_artist_categorization = await ArtistCategorization.updateOne(
        { artist_id },
        { $set: { ...categorizationRequestUpdate } }
      );
      const createWallet = await Wallet.create({
        owner_id: artist_id,
        base_currency: get_artist.base_currency,
      });
      const update_artist_acc = await AccountArtist.updateOne(
        { artist_id },
        {
          $set: {
            artist_verified: true,
            wallet_id: createWallet.wallet_id,
            algo_data_id: get_artist_categorization.id,
            categorization:
              categorizationRequestUpdate.current.categorization
                .artist_categorization,
          },
        }
      );

      const [accept_artist_verif_result] = await Promise.all([
        update_artist_categorization,
        update_artist_acc,
        createWallet,
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
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  } finally {
    session.endSession();
  }
});
