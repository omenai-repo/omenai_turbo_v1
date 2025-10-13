import { ShipmentDeliveryValidation } from "@omenai/shared-types";
import mongoose, { Schema, model, models } from "mongoose";

const validateShipmentDelivery = new Schema<ShipmentDeliveryValidation>(
  {
    tracking_id: { type: String, required: true },
    author_id: { type: String, required: true },
    anount_to_inc: { type: Number, required: true },
    estimated_delivery_date: { type: Date || String, required: true },
  },
  { timestamps: true }
);

export const ValidateShipmentDelivery =
  models.ValidateShipmentDelivery ||
  mongoose.model("ValidateShipmentDelivery", validateShipmentDelivery);
