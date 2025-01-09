import mongoose, { Schema, model, models } from "mongoose";

const salesActivity = new Schema(
  {
    month: { type: String, required: true },
    year: { type: String, required: true },
    value: { type: Number, required: true },
    id: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const SalesActivity =
  models.SalesActivity || mongoose.model("SalesActivity", salesActivity);
