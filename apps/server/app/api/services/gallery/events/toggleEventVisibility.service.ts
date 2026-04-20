"use server";

import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

export async function toggleEventVisibility(
  eventId: string,
  galleryId: string,
  targetStatus: boolean,
) {
  try {
    const updatedEvent = await GalleryEvent.findOneAndUpdate(
      { event_id: eventId, gallery_id: galleryId },
      { $set: { is_published: targetStatus } },
      { new: true },
    );

    if (!updatedEvent) {
      return { isOk: false, message: "Event not found or unauthorized." };
    }

    const statusText = targetStatus ? "published" : "moved to drafts";
    return { isOk: true, message: `Presentation successfully ${statusText}.` };
  } catch (error) {
    console.error("Error toggling visibility:", error);
    return { isOk: false, message: "Internal server error." };
  }
}
