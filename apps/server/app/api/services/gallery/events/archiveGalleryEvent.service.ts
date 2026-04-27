// @omenai/shared-services/gallery/programming/archiveGalleryEvent.ts

import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

export async function archiveGalleryEvent(
  event_id: string,
  gallery_id: string,
) {
  try {
    // 1. Mark the event as archived
    const event = await GalleryEvent.findOneAndUpdate(
      { event_id, gallery_id }, // Ensure the gallery actually owns this event
      { $set: { is_archived: true } },
      { new: true },
    );

    if (!event) {
      return { isOk: false, message: "Event not found or unauthorized." };
    }

    // 2. The Status Sync Teardown: Release attached artworks back to standard inventory
    if (event.featured_artworks && event.featured_artworks.length > 0) {
      await Artworkuploads.updateMany(
        { art_id: { $in: event.featured_artworks } },
        {
          $set: {
            exhibition_status: {
              status: "completed", // Marks it as part of their provenance, but no longer actively showing
              event_id: event.event_id,
              event_name: event.title,
            },
          },
        },
      );
    }

    return { isOk: true, message: "Event successfully archived." };
  } catch (error) {
    console.error("Error archiving event:", error);
    return { isOk: false, message: "Failed to archive event." };
  }
}
