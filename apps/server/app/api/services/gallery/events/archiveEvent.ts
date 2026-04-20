import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { GalleryEvent as GalleryEventType } from "@omenai/shared-types";
import { redis } from "@omenai/upstash-config";

export async function archiveEvent(eventId: string, galleryId: string) {
  try {
    // 1. Fetch the event to get the list of attached artworks
    const event = (await GalleryEvent.findOne({
      event_id: eventId,
      gallery_id: galleryId,
    }).lean()) as unknown as GalleryEventType;

    if (!event) {
      return { isOk: false, message: "Event not found or unauthorized." };
    }

    if (event.is_archived) {
      return { isOk: false, message: "Event is already archived." };
    }

    // 2. Shut down the Event
    await GalleryEvent.findOneAndUpdate(
      { event_id: eventId, gallery_id: galleryId },
      { $set: { is_archived: true } },
    );

    const attachedArtworkIds = event.featured_artworks || [];

    // 3. The Mass Mutex Unlock (Only run if there are artworks attached)
    if (attachedArtworkIds.length > 0) {
      // Free them in MongoDB
      await Artworkuploads.updateMany(
        { art_id: { $in: attachedArtworkIds }, author_id: galleryId },
        { $set: { exhibition_status: null } },
      );

      // 4. The Mass Redis Cache Sync
      const updatedArtworks = await Artworkuploads.find({
        art_id: { $in: attachedArtworkIds },
        author_id: galleryId,
      }).lean();

      const pipeline = redis.pipeline();
      updatedArtworks.forEach((art) => {
        pipeline.set(`artwork:${art.art_id}`, JSON.stringify(art));
      });
      await pipeline.exec();
    }

    return {
      isOk: true,
      message: "Event successfully archived and inventory released.",
    };
  } catch (error) {
    console.error("Error archiving event:", error);
    return { isOk: false, message: "Internal server error during archival." };
  }
}
