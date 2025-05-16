import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { NexusDocument } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";
// Enum for threshold types
export enum ThresholdType {
  SALES_ONLY = "SALES_ONLY",
  SALES_OR_TRANSACTIONS = "SALES_OR_TRANSACTIONS",
  SALES_AND_TRANSACTIONS = "SALES_AND_TRANSACTIONS",
}

// Enum for evaluation periods
export enum EvaluationPeriodType {
  PREVIOUS_CALENDAR_YEAR = "PREVIOUS_CALENDAR_YEAR",
  PREVIOUS_OR_CURRENT_CALENDAR_YEAR = "PREVIOUS_OR_CURRENT_CALENDAR_YEAR",
  ROLLING_12_MONTHS = "ROLLING_12_MONTHS",
  TWELVE_MONTHS_ENDING_SEPTEMBER_30 = "TWELVE_MONTHS_ENDING_SEPTEMBER_30",
  PREVIOUS_12_MONTHS = "PREVIOUS_12_MONTHS",
}

// MongoDB Schema Definition
const nexusTransactions = new Schema<NexusDocument>({
  state: { type: String, required: true },
  stateCode: { type: String, required: true },
  nexus_rule: {
    sales_threshold: { type: Number, required: true },
    transactions_threshold: { type: Number, default: null },
    threshold_type: {
      type: String,
      enum: Object.values(ThresholdType),
      required: true,
    },
    evaluation_period_type: {
      type: String,
      enum: Object.values(EvaluationPeriodType),
      required: true,
    },
  },
  calculation: {
    total_sales: { type: Number, default: 0 },
    total_transactions: { type: Number, default: 0 },
    sales_exposure_percentage: { type: Number, default: 0 },
    transactions_exposure_percentage: { type: Number, default: 0 },
  },
  is_nexus_breached: { type: Boolean, default: false },
  date_of_breach: { type: Date, default: null },
  last_reset: { type: Date, default: toUTCDate(new Date()) },
  tax_withholding_eligibility: { type: Boolean, default: false },
});

// Export the Model

export const NexusTransactions =
  mongoose.models.NexusTransactions ||
  mongoose.model("NexusTransactions", nexusTransactions);
