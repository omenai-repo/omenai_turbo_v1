import mongoose, { Schema } from "mongoose";
import { PriceReviewRequest } from "@omenai/shared-types";

const artworkPriceReviewSchema = new Schema<PriceReviewRequest>(
  {
    artist_id: { type: String, required: true, index: true },

    artist_review: {
      requested_price: { type: Number, required: true },
      justification_type: {
        type: String,
        enum: [
          "PAST_SALE",
          "GALLERY_EXHIBITION",
          "HIGH_COST_MATERIALS",
          "OTHER",
        ],
        required: true,
      },
      justification_proof_url: { type: String, default: "" },
      justification_notes: { type: String, default: "" },
    },

    meta: {
      artwork: { type: Schema.Types.Mixed, required: true },
      algorithm_recommendation: {
        recommendedPrice: { type: Number, required: true },
        priceRange: { type: [Number], required: true },
        meanPrice: { type: Number, required: true },
      },
    },

    review: {
      counter_offer_price: { type: Number },
      admin_notes: { type: String, default: "" },
      decline_reason: { type: String, default: "" },
      action_taken_by: { type: String },
      action_date: { type: Date },
    },

    status: {
      type: String,
      enum: [
        "PENDING_ADMIN_REVIEW",
        "PENDING_ARTIST_ACTION",
        "APPROVED_ARTIST_PRICE",
        "APPROVED_COUNTER_PRICE",
        "DECLINED_BY_ADMIN",
        "DECLINED_BY_ARTIST",
        "AUTO_APPROVED",
      ],
      default: "PENDING_ADMIN_REVIEW",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const PriceReview =
  mongoose.models.PriceReview ||
  mongoose.model("PriceReview", artworkPriceReviewSchema);
