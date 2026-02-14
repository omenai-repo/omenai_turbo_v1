import { WalletModelSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const wallet = new Schema<WalletModelSchemaTypes>(
  {
    owner_id: { type: String, required: true, index: true },
    wallet_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    available_balance: { type: Number, default: () => 0 },
    pending_balance: { type: Number, default: () => 0 },
    primary_withdrawal_account: {
      type: Schema.Types.Mixed,
      default: () => null,
    },
    wallet_currency: { type: String, default: () => "USD" },
    base_currency: { type: String, required: true },
    wallet_pin: { type: String, default: () => null },
    applied_payment_refs: { type: [String], default: () => [], index: true },
  },
  { timestamps: true }
);

export const Wallet =
  mongoose.models.Wallet || mongoose.model("Wallet", wallet);
