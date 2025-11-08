import mongoose, { Schema, Document, Model } from "mongoose";
import { DeletionAuditLog } from "@omenai/shared-types";
export interface DeletionAuditLogDocument extends DeletionAuditLog, Document {}

const TaskSummarySchema = new Schema({
  service: {
    type: String,
    required: true,
    enum: [
      "order_service",
      "upload_service",
      "wallet_service",
      "wallet_transaction_service",
      "purchase_transaction_service",
      "subscription_transaction_service",
      "account_service",
      "subscriptions_service",
      "misc_service",
    ],
  },
  deletionRecordSummary: { type: Schema.Types.Mixed },
  note: { type: String, required: true },
  status: {
    type: String,
    enum: ["complete", "incomplete"],
    required: true,
  },
  completed_at: { type: Date },
  error_message: { type: String },
});

const DeletionAuditLogSchema = new Schema<DeletionAuditLogDocument>(
  {
    deletion_request_id: {
      type: String,
      required: true,
      index: true,
      ref: "DeletionRequest",
    },
    target_ref: {
      target_id: { type: String, required: true },
      target_email_hash: { type: String, required: true },
    },
    initiated_by: {
      type: String,
      enum: ["target", "admin", "system"],
      required: true,
    },
    tasks_summary: { type: [TaskSummarySchema], required: true },
    requested_at: { type: Date, required: true },
    completed_at: { type: Date },
    retention_expired_at: { type: Date, required: true },
    signature: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for audit and retrieval
DeletionAuditLogSchema.index({ target_id: 1 });
DeletionAuditLogSchema.index({ "target_ref.target_email_hash": 1 });
DeletionAuditLogSchema.index(
  { retention_expires_at: 1 },
  { expireAfterSeconds: 0 }
); // Auto-delete after retention expiry

export const DeletionAuditLogModel: Model<DeletionAuditLogDocument> =
  mongoose.models.DeletionAuditLog ||
  mongoose.model<DeletionAuditLogDocument>(
    "DeletionAuditLog",
    DeletionAuditLogSchema
  );
