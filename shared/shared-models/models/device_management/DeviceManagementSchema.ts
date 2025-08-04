// models/FailedJob.ts
import mongoose from "mongoose";

const deviceManagementSchema = new mongoose.Schema<{
  device_id: string;
  auth_id: string;
}>(
  {
    device_id: { type: String, required: true },
    auth_id: { type: String, required: true },
  },
  { timestamps: true }
);

export const DeviceManagement =
  mongoose.models.DeviceManagement ||
  mongoose.model("DeviceManagement", deviceManagementSchema);
