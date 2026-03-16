import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { NextResponse } from "next/server";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { uploadArtworkLogic } from "../../uploadArtwork.service";
import { sendPriceReviewRequest } from "@omenai/shared-emails/src/models/artist/sendPriceReviewRequest";
import { sendArtworkPriceReviewEmail } from "@omenai/shared-emails/src/models/admin/sendArtworkPriceReviewEmail";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const body = await request.json();
    const { artist_id, artist_review, meta } = body;

    // 1. Fetch the Artist's Profile to check allowances and category
    const artist = await AccountArtist.findOne({ artist_id });
    if (!artist) {
      return NextResponse.json(
        { message: "Artist not found" },
        { status: 404 },
      );
    }

    // 2. Handle the Monthly Rollover Logic
    const now = new Date();
    const lastReset = new Date(artist.pricing_allowances.last_reset_date);
    let currentUsage = artist.pricing_allowances.auto_approvals_used;

    // If we are in a new month, reset their usage counter to 0
    if (
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()
    ) {
      currentUsage = 0;
      artist.pricing_allowances.auto_approvals_used = 0;
      artist.pricing_allowances.last_reset_date = now;
    }

    // 3. Gate 1: The Usage Cap Check
    const MAX_AUTO_APPROVES_PER_MONTH = 3;
    let finalStatus = "PENDING_ADMIN_REVIEW";
    let isAutoApproved = false;

    if (currentUsage < MAX_AUTO_APPROVES_PER_MONTH) {
      // 4. Gate 2: The Dynamic Threshold Math
      const categoryVariances = {
        Emerging: 0.1,
        "Early Mid-Career": 0.2,
        "Mid-Career": 0.25,
        "Late Mid-Career": 0.35,
        Established: 0.35,
        Elite: 0.35,
      };

      const artistCategory = artist.categorization || "Emerging";
      const variance =
        categoryVariances[artistCategory as keyof typeof categoryVariances];

      // Anchor to the upper-middle range (Index 3)
      const anchorPrice = meta.algorithm_recommendation.priceRange[3];
      const maxAllowedPrice = anchorPrice * (1 + variance);

      // Evaluate the requested price
      if (artist_review.requested_price <= maxAllowedPrice) {
        finalStatus = "AUTO_APPROVED";
        isAutoApproved = true;
      }
    }

    // 5. Construct and Save the Review Document
    const newReview = new PriceReview({
      artist_id,
      artist_review,
      meta,
      status: finalStatus,
    });

    await newReview.save();

    await sendPriceReviewRequest({
      name: artist.name,
      email: artist.email,
      artwork_title: meta.artwork.title,
    });
    await sendArtworkPriceReviewEmail({
      name: artist.name,
      email: "moses@omenai.net",
      artwork_title: meta.artwork.title,
      requested_price: artist_review.requested_price,
    });

    // 6. If auto-approved, increment their usage tracker and save the profile
    if (isAutoApproved) {
      artist.pricing_allowances.auto_approvals_used += 1;
      await artist.save();

      // NOTE: Trigger your artwork publishing function here since it's approved
      await uploadArtworkLogic(meta.artwork);
    }

    return NextResponse.json(
      {
        message: "Review processed successfully",
        status: finalStatus,
        data: newReview,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Price Review Creation Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});
