import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const createOrder = new Schema<CreateOrderModelTypes>(
  {
    artwork_data: {
      title: { type: String, required: true, trim: true },
      url: { type: String, required: true, index: true },
      artist: { type: String, required: true },
      art_id: { type: String, required: true, index: true },
      role_access: {
        role: { type: String },
        designation: { type: String },
      },
      pricing: {
        usd_price: { type: Number, required: true },
        shouldShowPrice: { type: String },
      },
      dimensions: { type: Schema.Types.Mixed, required: true },

      exclusivity_status: { type: Schema.Types.Mixed },
      deletedEntity: { type: Boolean, default: false },
    },
    buyer_details: { type: Schema.Types.Mixed, required: true },
    seller_details: { type: Schema.Types.Mixed, required: true },
    order_id: {
      type: String,
      default: () => generateDigit(7),
      unique: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      default: "processing",
      index: true,
    },
    shipping_details: { type: Schema.Types.Mixed, required: true },
    seller_designation: { type: String, required: true },
    exhibition_status: { type: Schema.Types.Mixed, default: () => null },
    hold_status: { type: Schema.Types.Mixed, default: () => null, index: true },
    payment_information: {
      type: Schema.Types.Mixed,
      required: true,
    },

    order_accepted: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    availability: { type: Boolean, default: () => true },
    expiresAt: { type: Date || null, default: null },
  },
  { timestamps: true },
);

export const CreateOrder =
  mongoose.models.CreateOrder || mongoose.model("CreateOrder", createOrder);
