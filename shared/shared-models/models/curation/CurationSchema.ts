import mongoose, { Schema } from "mongoose";

const curatedItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["artwork", "article", "gallery", "promotionals", "events"],
      required: true,
    },
    identifier: {
      type: String,
      required: true,
    },
  },
  { _id: false }, // Prevent Mongoose from creating unnecessary ObjectIds for every item in the array
);

const curationSchema = new Schema(
  {
    curation_type: {
      type: String,
      enum: ["curator_picks", "featured_feed"],
      required: true,
      unique: true,
    },
    draft_items: [curatedItemSchema],
    published_items: [curatedItemSchema],
    last_published_at: { type: Date },
    last_published_by: { type: String }, // Stores the admin_id from the session
  },
  { timestamps: true },
);

export const Curation =
  mongoose.models.Curation || mongoose.model("Curation", curationSchema);

const curationHistorySchema = new Schema(
  {
    curation_type: {
      type: String,
      required: true,
    },
    published_items: [curatedItemSchema],
    published_by: {
      type: String,
      required: true, // Stores the admin_id from the session
    },
  },
  { timestamps: { createdAt: "published_at", updatedAt: false } },
);

export const CurationHistory =
  mongoose.models.CurationHistory ||
  mongoose.model("CurationHistory", curationHistorySchema);
