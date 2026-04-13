import { WalletModelSchemaTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const baseAccountOptions = { discriminatorKey: "type", _id: false };

const BaseWithdrawalAccountSchema = new Schema(
  {
    account_name: { type: String, required: true },
    bank_country: { type: String, required: true },
    beneficiary_id: { type: Number, required: true },
    flutterwave_recipient_id: { type: String },
  },
  baseAccountOptions,
);

// 2. Define the main Wallet schema
const walletSchema = new Schema<WalletModelSchemaTypes>(
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

    // Replace Schema.Types.Mixed with our heavily typed Base Schema
    primary_withdrawal_account: {
      type: BaseWithdrawalAccountSchema,
      default: () => null,
    },

    wallet_currency: { type: String, default: () => "USD" },
    base_currency: { type: String, required: true },
    wallet_pin: { type: String, default: () => null },
    applied_payment_refs: { type: [String], default: () => [], index: true },
  },
  { timestamps: true },
);

const accountPath = walletSchema.path("primary_withdrawal_account") as any;

accountPath.discriminator(
  "africa",
  new Schema(
    {
      account_number: { type: String, required: true },
      bank_name: { type: String, required: true },
      bank_code: { type: String, required: true },
      bank_id: { type: String },
      branch: { type: Schema.Types.Mixed },
    },
    { _id: false },
  ),
);

// UK variant (requires account number and sort code)
accountPath.discriminator(
  "uk",
  new Schema(
    {
      account_number: { type: String, required: true },
      sort_code: { type: String, required: true },
      bank_name: { type: String },
    },
    { _id: false },
  ),
);
accountPath.discriminator(
  "us",
  new Schema(
    {
      account_number: { type: String, required: true },
      routing_number: { type: String, required: true },
      bank_name: { type: String },
    },
    { _id: false },
  ),
);

// EU variant (requires IBAN and SWIFT/BIC)
accountPath.discriminator(
  "eu",
  new Schema(
    {
      iban: { type: String, required: true },
      swift_code: { type: String, required: true },
      bank_name: { type: String },
    },
    { _id: false },
  ),
);

// 4. Export the strictly typed Wallet model
export const Wallet =
  mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
