import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const createOrder = new Schema<CreateOrderModelTypes>(
  {
    artwork_data: { type: Schema.Types.Mixed, required: true },
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
  { timestamps: true }
);

export const CreateOrder =
  mongoose.models.CreateOrder || mongoose.model("CreateOrder", createOrder);
