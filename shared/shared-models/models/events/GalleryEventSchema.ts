import { Schema, model, models } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const GalleryEventLocationSchema = new Schema(
  {
    venue: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { _id: false },
);

const GalleryEventSchema = new Schema(
  {
    event_id: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    gallery_id: {
      type: String,
      required: true,
      index: true,
    },
    event_type: {
      type: String,
      enum: ["exhibition", "art_fair", "viewing_room"],
      required: true,
    },
    installation_views: {
      type: [String],
      default: [],
    },

    // Universal Details
    title: { type: String, required: true },
    description: { type: String, required: true },
    cover_image: { type: String, required: true },

    // Chronology
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    is_archived: { type: Boolean, default: false },

    // Relational Arrays
    participating_artists: { type: [String], default: [] },
    featured_artworks: { type: [String], default: [] },

    // NEW: Visibility and Access Control
    is_published: { type: Boolean, default: false }, // Controls Draft vs Live state
    vip_access_token: { type: String, default: null }, // Unique crypto token for early access

    // Modular Data (Optional at DB level, enforced at Zod validation level)
    location: { type: GalleryEventLocationSchema, default: null },
    booth_number: { type: String, default: "" },
    vip_preview_date: { type: Date, default: null },
    external_url: { type: String, default: "" },
  },
  { timestamps: true },
);

// Create compound index for fast sorting of a gallery's events by date
GalleryEventSchema.index({ gallery_id: 1, start_date: -1 });

export const GalleryEvent =
  models.GalleryEvent || model("GalleryEvent", GalleryEventSchema);
