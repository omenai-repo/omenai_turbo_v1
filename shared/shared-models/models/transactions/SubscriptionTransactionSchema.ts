import { SubscriptionTransactionModelSchemaTypes } from "@omenai/shared-types";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import mongoose, { Schema } from "mongoose";

const subscription_transaction =
  new Schema<SubscriptionTransactionModelSchemaTypes>(
    {
      trans_id: { type: String, default: () => `SUB_OM_${generateDigit(6)}` },
      payment_ref: { type: String, required: true },
      amount: { type: String, required: true },
      date: { type: Date, required: true },
      gallery_id: { type: String, required: true },
      status: {
        type: String,
        enum: ["processing", "successful", "failed"],
        required: true,
      },
      stripe_customer_id: { type: String, required: true },
    },
    { timestamps: true }
  );

export const SubscriptionTransactions =
  mongoose.models.SubscriptionTransactions ||
  mongoose.model("SubscriptionTransactions", subscription_transaction);
