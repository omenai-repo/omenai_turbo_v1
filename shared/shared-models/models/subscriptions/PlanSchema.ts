import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { SubscriptionPlanDataTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const subscriptionPlan = new Schema<SubscriptionPlanDataTypes>(
  {
    name: { type: String, required: true },
    plan_id: {
      type: String,
      unique: true,
      index: true,
      default: () => generateDigit(7),
    },
    benefits: { type: Schema.Types.Mixed, required: true },
    currency: { type: String, default: () => "USD" },
    pricing: { type: Schema.Types.Mixed, required: true },
  },

  { timestamps: true }
);

export const SubscriptionPlan =
  mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", subscriptionPlan);
