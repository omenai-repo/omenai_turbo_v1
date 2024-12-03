import { ProrationSchemaTypes } from "@omenai/shared-types";
import { Schema, model, models } from "mongoose";

const prorationModel = new Schema<ProrationSchemaTypes>(
  {
    gallery_id: { type: String, required: true, unique: true, index: true },
    value: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Proration = models.Proration || model("Proration", prorationModel);
