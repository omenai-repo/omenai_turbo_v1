import { BuyingFrequency, IWaitlistLead } from "@omenai/shared-types";
import mongoose, { Schema, Model } from "mongoose";

const WaitlistLeadSchema = new Schema<IWaitlistLead>(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, default: "Unknown" },

    entity: {
      type: String,
      enum: ["artist", "collector"],
      required: true,
    },

    // Flexible container for the category-specific answers
    kpi: { type: Schema.Types.Mixed, required: true },

    // 📍 This is where your Traffic Source data lives
    marketing: {
      source: { type: String, default: "direct" },
      medium: { type: String, default: "none" },
      campaign: { type: String, default: "none" },
      referrer: { type: String, default: "" },
    },
    device: { type: Schema.Types.Mixed, required: false },

    hasConvertedToPaid: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 3. Model Creation
const WaitlistLead: Model<IWaitlistLead> =
  mongoose.models.WaitlistLead ||
  mongoose.model<IWaitlistLead>("WaitlistLead", WaitlistLeadSchema);

export default WaitlistLead;
