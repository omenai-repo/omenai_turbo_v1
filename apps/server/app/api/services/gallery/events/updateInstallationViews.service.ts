import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

export async function updateInstallationViews(
  galleryId: string,
  eventId: string,
  newImageUrls: string[],
) {
  try {
    const updatedEvent = await GalleryEvent.findOneAndUpdate(
      { event_id: eventId, gallery_id: galleryId },
      { $push: { installation_views: { $each: newImageUrls } } },
      { new: true },
    );

    if (!updatedEvent) {
      return { isOk: false, message: "Event not found or unauthorized." };
    }

    return { isOk: true, message: "Installation views updated." };
  } catch (error) {
    console.error("Error updating installation views:", error);
    return { isOk: false, message: "Internal server error during update." };
  }
}

export async function removeInstallationView(
  galleryId: string,
  eventId: string,
  viewIdToRemove: string,
) {
  try {
    // $pull removes the specific string from the array
    const updatedEvent = await GalleryEvent.findOneAndUpdate(
      { event_id: eventId, gallery_id: galleryId },
      { $pull: { installation_views: viewIdToRemove } },
      { new: true },
    );

    if (!updatedEvent) {
      return { isOk: false, message: "Event not found or unauthorized." };
    }

    return { isOk: true, message: "Installation view removed successfully." };
  } catch (error) {
    console.error("Error removing installation view:", error);
    return { isOk: false, message: "Internal server error during removal." };
  }
}
