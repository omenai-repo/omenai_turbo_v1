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
    if (!artist_id) throw new BadRequestError("Artist ID is required");

    const artist = await AccountArtist.findOne(
      { artist_id },
      "name email base_currency"
    );
    const categorization = await ArtistCategorization.findOne(
      { artist_id },
      "request history id"
    );

    if (!artist || !categorization) throw new NotFoundError("Artist not found");

    // Prepare categorization update
    const previousHistory = categorization.history ?? [];
    const nextCategorization =
      recommendation ||
      categorization.request?.categorization?.artist_categorization;

    const categorizationUpdate = {
      history: [
        ...previousHistory,
        {
          ...categorization.request,
          categorization: {
            ...categorization.request.categorization,
            artist_categorization: nextCategorization,
          },
        },
      ],
      current: {
        date: new Date(),
        categorization: {
          ...categorization.request.categorization,
          artist_categorization: nextCategorization,
        },
      },
      request: null,
    };

    let wallet;

    await session.withTransaction(async () => {
      // Update categorization
      const categorizationResult = await ArtistCategorization.updateOne(
        { artist_id },
        { $set: categorizationUpdate },
        { session }
      );
      if (!categorizationResult.acknowledged)
        throw new ServerError("Failed to update categorization");

      // Create wallet
      wallet = await Wallet.create(
        [
          {
            owner_id: artist_id,
            base_currency: artist.base_currency,
          },
        ],
        { session }
      );
      wallet = wallet[0];

      // Update artist account
      const artistResult = await AccountArtist.updateOne(
        { artist_id },
        {
          $set: {
            artist_verified: true,
            wallet_id: wallet.wallet_id,
            algo_data_id: categorization.id,
            categorization: nextCategorization,
          },
        },
        { session }
      );
      if (!artistResult.acknowledged)
        throw new ServerError("Failed to update artist account");
    });

    // Send email AFTER transaction succeeds
    await sendArtistAcceptedMail({
      name: artist.name,
      email: artist.email,
    });

    return NextResponse.json(
      { message: "Artist verification accepted" },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  } finally {
    session.endSession();
  }
});
