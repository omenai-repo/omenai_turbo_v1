// models/FailedJob.ts
import { FailedCronJobTypes } from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import mongoose from "mongoose";

const FailedJobSchema = new mongoose.Schema<FailedCronJobTypes>({
  jobType: String,
  payload: mongoose.Schema.Types.Mixed,
  reason: String,
  retryCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "reprocessed", "failed"],
    default: "pending",
  },
  lastAttempted: { type: Date, default: () => toUTCDate(new Date()) },
  jobId: { type: String, unique: true },
});

export const FailedJob =
  mongoose.models.FailedJob || mongoose.model("FailedJob", FailedJobSchema);
