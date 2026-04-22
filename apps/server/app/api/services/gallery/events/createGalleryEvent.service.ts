import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateGalleryEventPayload } from "@omenai/shared-lib/zodSchemas/GalleryEventValidationSchema";
import { redis } from "@omenai/upstash-config";

export async function createGalleryEvent(data: CreateGalleryEventPayload) {
  try {
    const newEvent = await GalleryEvent.create({ ...data, is_archived: false });

    if (data.featured_artworks && data.featured_artworks.length > 0) {
      await Artworkuploads.updateMany(
        { art_id: { $in: data.featured_artworks } },
        {
          $set: {
            exhibition_status: {
              status: "active",
              event_id: newEvent.event_id,
              event_name: newEvent.title,
            },
          },
        },
      );

      const updatedArtworks = await Artworkuploads.find({
        art_id: { $in: data.featured_artworks },
      })
        .lean()
        .exec();

      const pipeline = redis.pipeline();
      updatedArtworks.forEach((art) => {
        pipeline.set(`artwork:${art.art_id}`, JSON.stringify(art));
      });
      await pipeline.exec();
    }

    return {
      isOk: true,
      message: "Event successfully created",
      data: newEvent,
    };
  } catch (error) {
    console.error("Error creating gallery event:", error);
    return {
      isOk: false,
      message: "Failed to create programming event. Please try again.",
    };
  }
}
