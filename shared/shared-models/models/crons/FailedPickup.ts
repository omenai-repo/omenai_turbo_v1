import mongoose, { Schema, Document, Model } from "mongoose";

export interface FailedPickupTypes extends Document {
  order_id: string;
  carrier: "UPS" | "DHL";
  error_message: string;
  status: "pending" | "resolved" | "manual_intervention_required";
  retry_count: number;
  payload_snapshot: any;
  created_at: Date;
  updated_at: Date;
}

const FailedPickupSchema = new Schema<FailedPickupTypes>(
  {
    order_id: { type: String, required: true, index: true },
    carrier: { type: String, enum: ["UPS", "DHL"], required: true },
    error_message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "resolved", "manual_intervention_required"],
      default: "pending",
    },
    retry_count: { type: Number, default: 0 },
    payload_snapshot: { type: Object, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Prevent overwriting model if already compiled (Hot Reload safety)
export const FailedPickup: Model<FailedPickupTypes> =
  mongoose.models.FailedPickup ||
  mongoose.model<FailedPickupTypes>("FailedPickup", FailedPickupSchema);
