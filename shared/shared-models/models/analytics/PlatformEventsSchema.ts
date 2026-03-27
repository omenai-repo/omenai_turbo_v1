// Location: models/PlatformEvents.ts (or wherever you keep your Mongoose schemas)

import mongoose, { Schema } from "mongoose";
import { PlatformEventSchemaTypes } from "@omenai/shared-types";

const platformEventSchema = new Schema<PlatformEventSchemaTypes>(
  {
    event_type: {
      type: String,
      required: true,
      enum: [
        "page_view",
        "por_inquiry",
        "search",
        "checkout_initiated",
        "artwork_view",
        "artwork_saved",
        "artist_profile_view",
        "gallery_profile_view",
      ],
      index: true,
    },
    user_id: { type: String, default: null, index: true },
    session_id: { type: String, required: true, index: true },
    art_id: { type: String, default: null, index: true },
    entity_id: { type: String, default: null },

    tracking_data: {
      ip_address: { type: String, default: "Unknown" },
      country: { type: String, default: "Unknown", index: true }, // Indexed for fast global reach charts
      city: { type: String, default: "Unknown" },
      device_type: {
        type: String,
        enum: ["mobile", "desktop", "tablet", "unknown"],
        default: "unknown",
      },
      os: { type: String, default: "Unknown" },
      browser: { type: String, default: "Unknown" },
      referrer: { type: String, default: "direct" },
    },

    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    // We only need to know when the event happened, not when it was updated.
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// 1. Compound Index: This makes our dashboard aggregations lightning fast
// when we ask "Show me all 'por_inquiry' events from the last 7 days"
platformEventSchema.index({ event_type: 1, createdAt: -1 });

// 2. TTL (Time-To-Live) Index: The Lean Startup Lifesaver
// This automatically deletes documents older than 90 days.
// It prevents this collection from infinitely growing and blowing up your MongoDB Atlas bill.
platformEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 },
);

export const PlatformEvents =
  mongoose.models.PlatformEvents ||
  mongoose.model<PlatformEventSchemaTypes>(
    "PlatformEvents",
    platformEventSchema,
  );
