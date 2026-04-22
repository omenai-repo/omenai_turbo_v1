import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { redis } from "@omenai/upstash-config";

export async function removeArtworkFromEvent(
  eventId: string,
  artworkId: string,
  galleryId: string,
) {
  try {
    // 1. Verify Event Ownership & Remove ID from the array
    const eventUpdate = await GalleryEvent.findOneAndUpdate(
      { event_id: eventId, gallery_id: galleryId },
      { $pull: { featured_artworks: artworkId } },
      { new: true },
    );

    if (!eventUpdate) {
      return { isOk: false, message: "Event not found or unauthorized." };
    }

    // 2. The Mutex Unlock in MongoDB
    // We update the original artwork document to free it up
    const artworkUpdate = await Artworkuploads.findOneAndUpdate(
      { art_id: artworkId, author_id: galleryId },
      { $set: { exhibition_status: null } },
      { new: true },
    ).lean();

    if (artworkUpdate) {
      // 3. Surgical Redis Cache Overwrite
      // Overwrite the specific artwork cache with the newly freed document
      await redis.set(`artwork:${artworkId}`, JSON.stringify(artworkUpdate));
    }

    return { isOk: true, message: "Artwork successfully removed." };
  } catch (error) {
    console.error("Error removing artwork from event:", error);
    return { isOk: false, message: "Internal server error during removal." };
  }
}

export async function addArtworksToEvent(
  eventId: string,
  artworkIds: string[],
  galleryId: string,
) {
  if (!artworkIds || artworkIds.length === 0) {
    return { isOk: false, message: "No artworks provided." };
  }

  try {
    // 1. Verify Event Ownership & Add IDs to the array
    // $addToSet ensures we don't accidentally create duplicate IDs in the array
    const eventUpdate = await GalleryEvent.findOneAndUpdate(
      { event_id: eventId, gallery_id: galleryId },
      { $addToSet: { featured_artworks: { $each: artworkIds } } },
      { new: true },
    );

    if (!eventUpdate) {
      return { isOk: false, message: "Event not found or unauthorized." };
    }

    // 2. The Mutex Lock in MongoDB
    // We bulk update all selected artworks
    await Artworkuploads.updateMany(
      { art_id: { $in: artworkIds }, author_id: galleryId },
      {
        $set: {
          exhibition_status: {
            status: "active",
            event_id: eventUpdate.event_id,
            event_name: eventUpdate.title,
          },
        },
      },
    );

    // 3. Surgical Redis Cache Overwrite (Bulk)
    // Fetch the newly updated documents and overwrite them in the cache pipeline
    const updatedArtworks = await Artworkuploads.find({
      art_id: { $in: artworkIds },
    }).lean();

    const pipeline = redis.pipeline();
    updatedArtworks.forEach((art) => {
      pipeline.set(`artwork:${art.art_id}`, JSON.stringify(art));
    });
    await pipeline.exec();

    return {
      isOk: true,
      message: "Artworks successfully added to presentation.",
    };
  } catch (error) {
    console.error("Error adding artworks to event:", error);
    return { isOk: false, message: "Internal server error during addition." };
  }
}
