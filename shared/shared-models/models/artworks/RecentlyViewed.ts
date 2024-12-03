import mongoose, { Schema, model, models } from "mongoose";

const recentView = new Schema(
  {
    artwork: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    art_id: {
      type: String,
      required: true,
    },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export const RecentView =
  mongoose.models.RecentView || mongoose.model("RecentView", recentView);
