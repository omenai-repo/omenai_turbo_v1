import { ICampaignVisit } from "@omenai/shared-types";
import mongoose, { Schema, Model } from "mongoose";

const CampaignVisitSchema = new Schema<ICampaignVisit>(
  {
    source: { type: String, default: "direct" },
    medium: { type: String, default: "none" },
    campaign: { type: String, default: "none" },
    visitorId: { type: String, required: true },
    referrer: { type: String, default: "direct" },
    device: { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }, // We only care when they arrived
);

const CampaignVisit: Model<ICampaignVisit> =
  mongoose.models.CampaignVisit ||
  mongoose.model<ICampaignVisit>("CampaignVisit", CampaignVisitSchema);

export default CampaignVisit;
