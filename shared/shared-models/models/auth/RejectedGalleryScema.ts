import mongoose, { Schema, model, models } from "mongoose";

const rejectedGallerySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: 3,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const RejectedGallery =
  mongoose.models.RejectedGallery ||
  mongoose.model("RejectedGallery", rejectedGallerySchema);
