import { WalletTransactionModelSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const walletTransaction = new Schema<WalletTransactionModelSchemaTypes>(
  {
    wallet_id: { type: String, required: true },
    trans_amount: { type: Number, required: true },
    trans_status: { type: String, required: true },
    trans_date: { type: Date, required: true },
    trans_id: { type: String, default: () => uuidv4(), unique: true },
    trans_flw_ref_id: { type: String, required: true },
  },
  { timestamps: true }
);

export const WalletTransaction =
  mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", walletTransaction);
