// models/events/EventAnalyticsSchema.ts
import { GalleryEventAnalytics } from "@omenai/shared-types";
import { Schema, model, models } from "mongoose";

const EventAnalyticsSchema = new Schema<GalleryEventAnalytics>(
  {
    event_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    views: { type: Number, default: 0 },
    view_in_room: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    daily_stats: {
      type: Map,
      of: new Schema(
        {
          views: { type: Number, default: 0 },
          view_in_room: { type: Number, default: 0 },
          shares: { type: Number, default: 0 },
        },
        { _id: false },
      ),
      default: {},
    },
  },
  { timestamps: true },
);

export const EventAnalytics =
  models.EventAnalytics || model("EventAnalytics", EventAnalyticsSchema);
