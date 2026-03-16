import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadArtworkLogic } from "../../uploadArtwork.service";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";

const artistPatchSchema = z.object({
  artist_id: z.string(),
  review_id: z.string().min(1, "Review ID is required"),
  action: z.enum(["ACCEPT", "DECLINE"]),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsedData = artistPatchSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Validation failed: Request payload Invalid" },
        { status: 400 },
      );
    }

    const { review_id, action, artist_id } = parsedData.data;

    // 1. Ownership & Document Check
    const review = await PriceReview.findOne({
      _id: review_id,
      artist_id,
    });
    if (!review)
      return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const artwork = review.meta.artwork;
    // 2. Guardrail: Only act if there is a pending offer from Admin
    if (review.status !== "PENDING_ARTIST_ACTION") {
      return NextResponse.json(
        { error: "No pending offer to resolve" },
        { status: 400 },
      );
    }

    // 3. Update Status
    review.status =
      action === "ACCEPT" ? "APPROVED_COUNTER_PRICE" : "DECLINED_BY_ARTIST";
    await review.save();
    await uploadArtworkLogic(artwork);

    return NextResponse.json({
      message: `Offer ${action.toLowerCase()}ed`,
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
}
