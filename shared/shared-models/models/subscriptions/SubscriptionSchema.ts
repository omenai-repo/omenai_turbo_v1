import { SubscriptionModelSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const subscriptions = new Schema<SubscriptionModelSchemaTypes>(
  {
    start_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    paymentMethod: { type: Schema.Types.Mixed, required: true },
    stripe_customer_id: { type: String, required: true, index: true },
    customer: { type: Schema.Types.Mixed, required: true },
    status: { type: String, required: true },
    plan_details: {
      type: Schema.Types.Mixed,
      required: true,
    },
    next_charge_params: { type: Schema.Types.Mixed, required: true },
    upload_tracker: { type: Schema.Types.Mixed, required: true },
    subscription_id: {
      type: String,
      required: true,
      index: true,
      default: () => uuidv4(),
    },
  },

  { timestamps: true }
);

export const Subscriptions =
  mongoose.models.Subscriptions ||
  mongoose.model("Subscriptions", subscriptions);
