import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { PurchaseTransactionModelSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const purchase_transactions = new Schema<PurchaseTransactionModelSchemaTypes>(
  {
    trans_id: { type: String, default: () => `PAY_OM_${generateDigit(7)}` },
    trans_reference: { type: String, required: true },
    trans_pricing: { type: Schema.Types.Mixed, required: true },
    trans_date: { type: Date, required: true },
    trans_initiator_id: { type: String, required: true, index: true },
    trans_recipient_id: { type: String, required: true, index: true },
    trans_recipient_role: { type: String, required: true },
    status: { type: String, required: true },
    verifiedAt: { type: Date },
    webhookReceivedAt: { type: Date },
    createdBy: { type: String },
    webhookConfirmed: { type: Boolean },
  },
  { timestamps: true }
);

export const PurchaseTransactions =
  mongoose.models.PurchaseTransactions ||
  mongoose.model("PurchaseTransactions", purchase_transactions);
