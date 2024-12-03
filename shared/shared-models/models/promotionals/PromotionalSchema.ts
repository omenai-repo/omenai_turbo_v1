import { PromotionalSchemaTypes } from "@omenai/shared-types";
import { Schema, model, models } from "mongoose";

const promotionalModelSchema = new Schema<PromotionalSchemaTypes>(
  {
    headline: {
      type: String,
      required: true,
    },
    subheadline: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    cta: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const PromotionalModel =
  models.PromotionalModel || model("PromotionalModel", promotionalModelSchema);
