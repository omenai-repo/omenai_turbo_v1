import { Schema, model, models } from "mongoose";

const FailedDeletionTaskSchema = new Schema(
  {
    requestId: { type: String, required: true },
    service: { type: String, required: true },
    entityId: { type: String },
    entityType: { type: String, required: true },
    error: { type: String, required: true },
    attempts: { type: Number, default: 1 },
    nextRetryAt: {
      type: Date,
      default: () => new Date(Date.now() + 1 * 60 * 60 * 1000),
    },
    key: { type: String, index: true, unique: true },
  },
  { timestamps: true }
);

export const FailedDeletionTaskModel =
  models.FailedDeletionTask ||
  model("FailedDeletionTask", FailedDeletionTaskSchema);
