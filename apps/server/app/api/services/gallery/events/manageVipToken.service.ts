import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { v4 as uuidv4 } from "uuid";

export async function manageVipToken(
  eventId: string,
  galleryId: string,
  action: "generate" | "revoke",
) {
  try {
    const newToken = action === "generate" ? uuidv4() : null;

    const updatedEvent = await GalleryEvent.findOneAndUpdate(
      { event_id: eventId, gallery_id: galleryId },
      { $set: { vip_access_token: newToken } },
      { new: true },
    );

    if (!updatedEvent) {
      return { isOk: false, message: "Event not found." };
    }

    return {
      isOk: true,
      message:
        action === "generate" ? "VIP link generated." : "VIP link revoked.",
      token: newToken,
    };
  } catch (error) {
    console.error("Error managing VIP token:", error);
    return { isOk: false, message: "Internal server error." };
  }
}
