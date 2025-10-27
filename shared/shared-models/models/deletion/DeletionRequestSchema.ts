import { DeletionRequest } from "@omenai/shared-types";
import mongoose, { Schema, Document, Model } from "mongoose";

export interface DeletionRequestDocument extends DeletionRequest, Document {}

const DeletionRequestSchema = new Schema<DeletionRequestDocument>(
  {
    targetId: { type: String, required: true, index: true },
    initiatedBy: {
      type: String,
      required: true,
      enum: ["target", "admin", "system"],
    },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "in_progress", "completed", "failed", "cancelled"],
      required: true,
      default: "requested",
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    gracePeriodUntil: { type: Date },
    tasks: [{ type: Schema.Types.ObjectId, ref: "DeletionTask" }],
    metadata: { type: Schema.Types.Mixed },
    requestId: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

// Index by requestId and targetId for quick lookup
DeletionRequestSchema.index({ requestId: 1 });
DeletionRequestSchema.index({ targetId: 1 });

export const DeletionRequestModel: Model<DeletionRequestDocument> =
  mongoose.models.DeletionRequest ||
  mongoose.model<DeletionRequestDocument>(
    "DeletionRequest",
    DeletionRequestSchema
  );
