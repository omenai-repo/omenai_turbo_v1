import { DeletionRequest } from "@omenai/shared-types";
import mongoose, { Schema, Document, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface DeletionRequestDocument extends DeletionRequest, Document {}

const DeletionRequestSchema = new Schema<DeletionRequestDocument>(
  {
    targetId: { type: String, required: true },
    initiatedBy: {
      type: String,
      required: true,
      enum: ["target", "admin", "system"],
    },
    reason: { type: String, required: true },
    entityType: {
      type: String,
      required: true,
      enum: ["user", "artist", "gallery"],
    },
    status: {
      type: String,
      enum: ["requested", "in_progress", "completed", "failed", "cancelled"],
      required: true,
      default: "requested",
    },
    requestedAt: { type: Date },
    completedAt: { type: Date },
    gracePeriodUntil: { type: Date },
    tasks: [{ type: Schema.Types.ObjectId, ref: "DeletionTask" }],
    metadata: { type: Schema.Types.Mixed },
    requestId: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
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
