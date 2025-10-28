import { DeletionTask } from "@omenai/shared-types";
import mongoose, { Schema, Document, Model } from "mongoose";

export interface DeletionTaskDocument extends DeletionTask, Document {}

const DeletionTaskSchema = new Schema<DeletionTaskDocument>(
  {
    requestId: {
      type: String,
      required: true,
      index: true,
      ref: "DeletionRequest",
    },
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
    entityId: { type: String },
    entityType: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "done", "failed"],
      default: "pending",
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    idempotencyKey: { type: String, index: true },
    result: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

DeletionTaskSchema.index({ service: 1, requestId: 1 });
DeletionTaskSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export const DeletionTaskModel: Model<DeletionTaskDocument> =
  mongoose.models.DeletionTask ||
  mongoose.model<DeletionTaskDocument>("DeletionTask", DeletionTaskSchema);
