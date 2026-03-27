import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { PriceRequestTypes } from "@omenai/shared-types"; // Adjust path as needed

const priceRequestSchema = new Schema<PriceRequestTypes>(
  {
    request_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    art_id: { type: String, required: true, index: true },
    buyer_id: { type: String, required: true, index: true },
    seller_id: { type: String, required: true, index: true },

    artwork_snapshot: {
      title: { type: String, required: true },
      artist: { type: String, required: true },
      url: { type: String, required: true },
    },

    funnel_status: {
      requested_at: { type: Date, default: Date.now },
      is_order_placed: { type: Boolean, default: false },
      order_id: { type: String, default: null },
      is_order_paid: { type: Boolean, default: false },
    },

    request_date: { type: Date, default: Date.now, index: true },

    // The Cleanup Strategy: MongoDB Native TTL (Time-To-Live) Index
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

// Add this right above your model export
priceRequestSchema.index({ buyer_id: 1, art_id: 1 }, { unique: true });

export const PriceRequest =
  mongoose.models.PriceRequest ||
  mongoose.model("PriceRequest", priceRequestSchema);
