// @omenai/shared-models/validations/GalleryEventValidation.ts

import { z } from "zod";

const BaseEventSchema = z.object({
  gallery_id: z.string().min(1, "Gallery ID is required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Please provide a more detailed description"),
  cover_image: z.string(),

  // z.coerce.date() automatically converts frontend ISO strings into Date objects
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),

  participating_artists: z.array(z.string()).default([]),
  featured_artworks: z.array(z.string()).default([]),
  installation_views: z.array(z.string()).optional(),
});

// 2. Reusable Location Object
const LocationSchema = z.object({
  venue: z.string().min(1, "Venue name is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
});

// 3. The Specific Type Variations
const ExhibitionSchema = BaseEventSchema.extend({
  event_type: z.literal("exhibition"),
  location: LocationSchema, // Exhibitions strictly require a physical location
});

const ArtFairSchema = BaseEventSchema.extend({
  event_type: z.literal("art_fair"),
  location: LocationSchema, // Fairs strictly require a physical location
  booth_number: z.string().optional(),
  vip_preview_date: z.preprocess(
    // If the frontend sends an empty string, convert it to undefined
    (val) => (val === "" || val === null ? undefined : val),
    // Then pass it to your existing logic!
    z.coerce.date().optional(),
  ),
});

const ViewingRoomSchema = BaseEventSchema.extend({
  event_type: z.literal("viewing_room"),
  // Viewing rooms are digital, so location is omitted entirely
  external_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

// 4. The Unified Export with Chronology Validation
export const GalleryEventValidationSchema = z
  .discriminatedUnion("event_type", [
    ExhibitionSchema,
    ArtFairSchema,
    ViewingRoomSchema,
  ])
  .superRefine((data, ctx) => {
    // Global rule: An event cannot end before it begins
    if (data.end_date < data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after the start date",
        path: ["end_date"],
      });
    }

    // Global rule: VIP preview (if it exists) must happen before or exactly on the start date
    if ("vip_preview_date" in data && data.vip_preview_date) {
      if (data.vip_preview_date > data.start_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "VIP preview cannot occur after the fair opens",
          path: ["vip_preview_date"],
        });
      }
    }
  });

// Export inferred types for frontend form state
export type CreateGalleryEventPayload = z.infer<
  typeof GalleryEventValidationSchema
>;
