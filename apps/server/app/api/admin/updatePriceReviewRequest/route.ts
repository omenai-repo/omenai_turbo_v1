import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { uploadArtworkLogic } from "../../uploadArtwork.service";
import { createErrorRollbarReport } from "../../util";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { sendPriceReviewApproved } from "@omenai/shared-emails/src/models/artist/sendPriceReviewApproved";
import { sendPriceReviewCompleted } from "@omenai/shared-emails/src/models/artist/sendPriceReviewCompleted";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};
export const PATCH = withRateLimitHighlightAndCsrf(config)(async function PATCH(
  request: Request,
) {
  try {
    const body = await request.json();

    const {
      review_id,
      action,
      counter_offer_price,
      admin_notes,
      decline_reason,
    } = body;

    await connectMongoDB();
    const review = await PriceReview.findById(review_id);

    const artist_id = review.artist_id;

    const artwork = review.meta.artwork;

    const artist = (await AccountArtist.findOne(
      { artist_id },
      "email name",
    ).lean()) as unknown as { email: string; name: string };

    if (!review) throw new NotFoundError("Review data not found.");

    if (review.status !== "PENDING_ADMIN_REVIEW") {
      return NextResponse.json(
        { message: "Review is no longer in pending state" },
        { status: 400 },
      );
    }

    if (action === "APPROVE") {
      review.status = "APPROVED_ARTIST_PRICE";
      review.review = { action_date: new Date(), action_taken_by: "ADMIIN" };
      await uploadArtworkLogic(artwork);

      await sendPriceReviewApproved({
        name: artist.name,
        email: artist.email,
        artwork_title: artwork.title,
      });
    } else if (action === "COUNTER_OFFER") {
      review.status = "PENDING_ARTIST_ACTION";
      review.review = {
        counter_offer_price,
        admin_notes,
        action_date: new Date(),
        action_taken_by: "ADMIIN",
      };
      review.meta.artwork = {
        ...artwork,
        pricing: {
          price: counter_offer_price,
          shouldShowPrice: artwork.pricing.shouldShowPrice,
          usd_price: counter_offer_price,
          currency: "USD",
        },
      };
      await sendPriceReviewCompleted({
        name: artist.name,
        email: artist.email,
        artwork_title: artwork.title,
      });
    } else if (action === "DECLINE") {
      review.status = "DECLINED_BY_ADMIN";
      review.review = {
        decline_reason,
        action_date: new Date(),
        action_taken_by: "ADMIIN",
      };
      // TODO: Send email to artwork informing them their artwork has been declined
      await sendPriceReviewCompleted({
        name: artist.name,
        email: artist.email,
        artwork_title: artwork.title,
      });
    }

    await review.save();
    return NextResponse.json({
      message: "Admin action recorded",
      data: review,
    });
  } catch (error) {
    console.error(error);
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("Price review", error, error_response.status);
    return NextResponse.json(
      { message: error_response.message },
      { status: error_response.status },
    );
  }
});
