import { ScheduledShipments } from "@omenai/shared-types";
import mongoose, { Schema } from "mongoose";

const scheduleShipment = new Schema<ScheduledShipments>(
  {
    order_id: { type: String, required: true, unique: true },
    executeAt: { type: Date || String, required: true },
    reminderSent: { type: Boolean, default: false },
    status: { type: String, default: "scheduled" },
  },
  { timestamps: true }
);

export const ScheduledShipment =
  mongoose.models.ScheduledShipment ||
  mongoose.model("ScheduledShipment", scheduleShipment);
