import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

export async function updateArtworkSequence(
  eventId: string,
  galleryId: string,
  newSequence: string[],
) {
  try {
    const updatedEvent = await GalleryEvent.findOneAndUpdate(
      { event_id: eventId, gallery_id: galleryId },
      { $set: { featured_artworks: newSequence } },
      { new: true },
    );

    if (!updatedEvent) {
      return { isOk: false, message: "Event not found or unauthorized." };
    }

    return { isOk: true, message: "Curatorial sequence updated." };
  } catch (error) {
    console.error("Error updating sequence:", error);
    return { isOk: false, message: "Failed to update sequence." };
  }
}
