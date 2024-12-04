import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const createOrder = new Schema<CreateOrderModelTypes>(
  {
    artwork_data: { type: Schema.Types.Mixed, required: true },
    buyer: { type: Schema.Types.Mixed, required: true },
    gallery_id: { type: String, required: true, index: true },
    order_id: {
      type: String,
      default: () => generateDigit(7),
      unique: true,
      index: true,
    },
    status: { type: String, required: true, default: "pending" },
    shipping_address: { type: Schema.Types.Mixed, required: true },
    shipping_quote: { type: Schema.Types.Mixed, required: true },
    gallery_details: { type: Schema.Types.Mixed, required: true },
    payment_information: {
      type: Schema.Types.Mixed,
      required: true,
    },
    tracking_information: {
      type: Schema.Types.Mixed,
      required: true,
    },
    order_accepted: {
      type: Schema.Types.Mixed,
      required: true,
    },
    delivery_confirmed: {
      type: Boolean,
      default: () => false,
    },

    availability: { type: Boolean, default: () => true },
  },
  { timestamps: true }
);

export const CreateOrder =
  mongoose.models.CreateOrder || mongoose.model("CreateOrder", createOrder);
