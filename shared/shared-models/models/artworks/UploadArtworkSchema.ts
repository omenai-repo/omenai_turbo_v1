import mongoose, { Schema, models } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
const artworkUpload = new Schema<ArtworkSchemaTypes>(
  {
    artist: { type: String, required: true },
    year: { type: Number, required: true },
    title: { type: String, required: true, unique: true, index: true },
    medium: { type: String, required: true },
    rarity: { type: String, required: true },
    materials: { type: String, required: true },
    availability: { type: Boolean, default: () => true },
    dimensions: {
      height: { type: String, required: true },
      weight: { type: String, required: true },
      length: { type: String, required: true },
    },
    pricing: {
      price: { type: Number, required: true },
      usd_price: { type: Number, required: true },
      currency: { type: String, required: true },
      shouldShowPrice: { type: String, required: true },
    },
    art_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    author_id: { type: String, required: true, index: true },
    url: { type: String, required: true, unique: true },
    impressions: { type: Number, default: 0 },
    like_IDs: { type: Schema.Types.Mixed, default: [] },
    artist_birthyear: { type: String, required: true },
    artist_country_origin: { type: String, required: true },
    certificate_of_authenticity: { type: String, required: true },
    artwork_description: { type: String },
    signature: { type: String, required: true },
    should_show_on_sub_active: {
      type: Boolean,
      default: () => true,
    },
    packaging_type: {
      type: String,
      enum: ["rolled", "stretched"],
      required: true,
    },
    role_access: { type: Schema.Types.Mixed, required: true },
    exclusivity_status: {
      exclusivity_type: { type: String || null, default: null },
      exclusivity_end_date: { type: Date || null, default: null },
      order_auto_rejection_count: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export const Artworkuploads =
  mongoose.models.Artworkuploads ||
  mongoose.model("Artworkuploads", artworkUpload);
