import { generateDigit } from "@omenai/shared-utils/src/generateToken.ts";
import { PurchaseTransactionModelSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const purchase_transactions = new Schema<PurchaseTransactionModelSchemaTypes>(
  {
    trans_id: { type: String, default: () => `PAY_OM_${generateDigit(7)}` },
    trans_reference: { type: String, required: true },
    trans_amount: { type: String, required: true },
    trans_date: { type: Date, required: true },
    trans_owner_id: { type: String, required: true },
    trans_owner_role: { type: String, required: true },
    trans_gallery_id: { type: String, required: true },
    trans_type: { type: String, required: true },
  },
  { timestamps: true }
);

export const PurchaseTransactions =
  mongoose.models.PurchaseTransactions ||
  mongoose.model("PurchaseTransactions", purchase_transactions);
