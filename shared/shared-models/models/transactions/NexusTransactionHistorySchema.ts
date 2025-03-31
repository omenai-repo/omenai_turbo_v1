import mongoose from "mongoose";

const nexusTransactionHistorySchema = new mongoose.Schema({
  state: { type: String, required: true },
  stateCode: { type: String, required: true },
  total_sales: { type: Number, required: true },
  total_transactions: { type: Number, required: true },
  date_of_breach: { type: Date, default: null },
  reset_date: { type: Date, required: true },
  evaluation_period_type: { type: String, required: true },
});

export const NexusTransactionHistoryModel =
  mongoose.models.NexusTransactionHistoryModel ||
  mongoose.model("NexusTransactionHistoryModel", nexusTransactionHistorySchema);
