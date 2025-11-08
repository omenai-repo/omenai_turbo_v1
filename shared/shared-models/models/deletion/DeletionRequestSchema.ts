import { DeletionRequest } from "@omenai/shared-types";
import mongoose, { Schema, Document, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

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
    entityType: {
      type: String,
      required: true,
      enum: ["user", "artist", "gallery"],
    },
    status: {
      type: String,
      enum: [
        "requested",
        "in progress",
        "completed",
        "tasks_created",
        "failed",
        "cancelled",
      ],
      required: true,
      default: "requested",
    },
    targetEmail: { type: String, required: true },
    requestedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    gracePeriodUntil: { type: Date },
    services: {
      type: [String],
      required: true,
    },

    metadata: { type: Schema.Types.Mixed },
    requestId: {
      type: String,
      unique: true,
      index: true,
      default: () => uuidv4(),
    },
  },
  {
    timestamps: true,
  }
);

export const DeletionRequestModel: Model<DeletionRequestDocument> =
  mongoose.models.DeletionRequest ||
  mongoose.model<DeletionRequestDocument>(
    "DeletionRequest",
    DeletionRequestSchema
  );
