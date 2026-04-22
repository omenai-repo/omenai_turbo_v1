import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { redis } from "@omenai/upstash-config";

export async function getIndividualShowService(eventId: string) {
  try {
    // 1. Fetch the Event and join the AccountGallery data
    const showData = await GalleryEvent.aggregate([
      {
        $match: {
          event_id: eventId,
          is_published: true,
          event_type: "exhibition",
        },
      },
      {
        $lookup: {
          from: "accountgalleries", // The actual DB collection name for your Gallery model
          localField: "gallery_id",
          foreignField: "gallery_id",
          as: "gallery_data",
        },
      },
      { $unwind: { path: "$gallery_data", preserveNullAndEmptyArrays: true } },
    ]);

    if (!showData || showData.length === 0) {
      return { isOk: false, message: "Show not found." };
    }

    const show = showData[0];

    // 2. Fetch artworks from Redis using the key pattern "artwork:<art_id>"
    // Promise.all maintains the exact order of the featured_artworks array!
    const cachedArtworksStrings = await Promise.all(
      show.featured_artworks.map((id: string) => redis.get(`artwork:${id}`)),
    );

    // 3. Safely parse the cached artworks
    const sortedArtworks = cachedArtworksStrings
      .map((artData) => {
        if (!artData) return null;

        // If your Redis client already parsed it into an object, just return it!
        if (typeof artData === "object") {
          return artData;
        }

        // If it's a string, attempt to parse it
        try {
          return JSON.parse(artData as string);
        } catch (error) {
          console.error("Redis JSON parse error for artwork:", error);
          // If it literally saved as "[object Object]", this catch block will
          // gracefully ignore it instead of crashing the page.
          return null;
        }
      })
      .filter(Boolean);

    const payload = {
      ...show,
      gallery: {
        name: show.gallery_data?.name,
        logo: show.gallery_data?.logo,
      },
      artworks: sortedArtworks,
    };

    delete payload.gallery_data;

    return { isOk: true, data: payload };
  } catch (error) {
    console.error("Error fetching show details:", error);
    return { isOk: false, message: "Internal server error." };
  }
}
