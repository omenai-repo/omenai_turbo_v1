import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import {  CreateOrderModelTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const createOrder = new Schema<CreateOrderModelTypes>(
  {
    artwork_data: { type: Schema.Types.Mixed, required: true },
    buyer_details: { type: Schema.Types.Mixed, required: true },
    seller_details: {type: Schema.Types.Mixed, required: true},
    order_id: {
      type: String,
      default: () => generateDigit(7),
      unique: true,
      index: true,
    },
    status: { type: String, required: true, default: "processing" },
    shipping_details: { type: Schema.Types.Mixed, required: true },
    payment_information: {
      type: Schema.Types.Mixed,
      required: true,
    },

    order_accepted: {
      type: Schema.Types.Mixed,
      required: true,
    },
    availability: { type: Boolean, default: () => true },


  },
  { timestamps: true }
);

export const CreateOrder =
  mongoose.models.CreateOrder || mongoose.model("CreateOrder", createOrder);
