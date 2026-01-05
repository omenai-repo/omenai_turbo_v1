import { PaymentLedgerTypes } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const paymentLedger = new Schema<PaymentLedgerTypes>(
  {
    provider: { enum: ["stripe", "flutterwave"], type: String, required: true },
    provider_tx_id: { type: String, required: true, index: true, unique: true },
    status: { type: String, required: true },
    payment_date: { type: Date, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: false },
    order_id: { type: String, required: true, index: true },
    payment_fulfillment: {
      artwork_marked_sold: {
        type: String,
        enum: ["done", "failed"],
        required: false,
      },
      seller_wallet_updated: {
        type: String,
        enum: ["done", "failed"],
        required: false,
      },
      order_updated: {
        type: String,
        enum: ["done", "failed"],
        required: false,
      },
      transaction_created: {
        type: String,
        enum: ["done", "failed"],
        required: false,
      },
      sale_record_created: {
        type: String,
        enum: ["done", "failed"],
        required: false,
      },
      mass_orders_updated: {
        type: String,
        enum: ["done", "failed"],
        required: false,
      },
    },
    payment_fulfillment_checks_done: {
      type: Boolean,
      required: true,
      default: false,
    },
    reconciliation_attempts: {
      type: Number,
      default: 0,
    },
    last_reconciliation_at: {
      type: Date,
    },
    needs_manual_review: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const PaymentLedger =
  mongoose.models.PaymentLedger ||
  mongoose.model("PaymentLedger", paymentLedger);
