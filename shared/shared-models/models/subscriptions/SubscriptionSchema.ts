import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const subscriptions = new Schema<SubscriptionModelSchemaTypes>(
  {
    start_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    payment: { type: Schema.Types.Mixed, required: true },
    card: { type: Schema.Types.Mixed, required: true },
    customer: { type: Schema.Types.Mixed, required: true, index: true },
    status: { type: String, required: true },
    plan_details: {
      type: Schema.Types.Mixed,
      required: true,
    },
    next_charge_params: { type: Schema.Types.Mixed, required: true },
    upload_tracker: { type: Schema.Types.Mixed, required: true },
  },

  { timestamps: true }
);

export const Subscriptions =
  mongoose.models.Subscriptions ||
  mongoose.model("Subscriptions", subscriptions);
