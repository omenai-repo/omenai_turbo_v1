import { WalletModelSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const wallet = new Schema<WalletModelSchemaTypes>(
  {
    owner_id: { type: String, required: true },
    wallet_id: { type: String, default: () => uuidv4(), unique: true },
    available_balance: { type: Number, default: () => 0 },
    pending_balance: { type: Number, default: () => 0 },
    primary_withdrawal_account: {
      type: Schema.Types.Mixed,
      default: () => null,
    },
  },
  { timestamps: true }
);

export const Wallet =
  mongoose.models.Wallet || mongoose.model("Wallet", wallet);
