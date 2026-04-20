"use server";

import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

export async function updateEventDetails(
  eventId: string,
  galleryId: string,
  updateData: any,
) {
  try {
    // 1. Initialize an empty object
    const allowedUpdates: any = {};

    // 2. Safely check and assign base fields (ignoring them if they aren't in the payload)
    if (updateData.title !== undefined) allowedUpdates.title = updateData.title;
    if (updateData.description !== undefined)
      allowedUpdates.description = updateData.description;
    if (updateData.start_date !== undefined)
      allowedUpdates.start_date = updateData.start_date;
    if (updateData.end_date !== undefined)
      allowedUpdates.end_date = updateData.end_date;
    if (updateData.vip_preview_date !== undefined)
      allowedUpdates.vip_preview_date = updateData.vip_preview_date;

    // THE NEW ADDITION: Cover Image
    if (updateData.cover_image !== undefined) {
      allowedUpdates.cover_image = updateData.cover_image;
    }

    // 3. Conditionally add type-specific fields
    if (updateData.booth_number !== undefined) {
      allowedUpdates.booth_number = updateData.booth_number;
    }

    if (updateData.external_url !== undefined) {
      allowedUpdates.external_url = updateData.external_url;
    }

    // 4. Handle the nested location object safely
    if (updateData.location) {
      allowedUpdates.location = {
        venue: updateData.location.venue,
        city: updateData.location.city,
        country: updateData.location.country,
      };
    }

    // Security/Sanity Check: Ensure there's actually something to update
    if (Object.keys(allowedUpdates).length === 0) {
      return { isOk: false, message: "No valid fields provided for update." };
    }

    // 5. Execute the update. $set will ONLY touch the fields present in allowedUpdates
    const updatedEvent = await GalleryEvent.findOneAndUpdate(
      { event_id: eventId, gallery_id: galleryId },
      { $set: allowedUpdates },
      { new: true },
    );

    if (!updatedEvent) {
      return { isOk: false, message: "Event not found or unauthorized." };
    }

    return { isOk: true, message: "Event details updated successfully." };
  } catch (error) {
    console.error("Error updating event details:", error);
    return { isOk: false, message: "Internal server error during update." };
  }
}
