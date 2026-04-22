import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";
import { redis } from "@omenai/upstash-config";

// 1. Service to get ALL Fairs & Viewing Rooms (Paginated)
export async function getAllFairsAndEventsService(
  page: number = 1,
  limit: number = 12,
  filter: string = "All",
) {
  try {
    const skip = (page - 1) * limit;

    // Build the dynamic match query based on the frontend filter
    const matchQuery: any = {
      is_published: true,
      is_archived: false,
      event_type: { $in: ["art_fair", "viewing_room"] },
    };

    // If you want to filter strictly by type on the backend:
    if (filter === "Fairs") matchQuery.event_type = "art_fair";
    if (filter === "Viewing Rooms") matchQuery.event_type = "viewing_room";

    const result = await GalleryEvent.aggregate([
      { $match: matchQuery },
      { $sort: { start_date: -1 } },
      {
        $facet: {
          metadata: [
            { $count: "total" },
            { $addFields: { page: page, limit: limit } },
          ],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "accountgalleries",
                localField: "gallery_id",
                foreignField: "gallery_id",
                as: "gallery_data",
              },
            },
            {
              $unwind: {
                path: "$gallery_data",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 0,
                event_id: 1,
                title: 1,
                event_type: 1,
                cover_image: 1,
                start_date: 1,
                end_date: 1,
                location: 1, // Crucial for Art Fairs
                "gallery.name": "$gallery_data.name",
              },
            },
          ],
        },
      },
    ]);

    const data = result[0].data;
    const metadata = result[0].metadata[0] || { total: 0, page, limit };
    const totalPages = Math.ceil(metadata.total / limit);

    return { isOk: true, data, pagination: { ...metadata, totalPages } };
  } catch (error) {
    console.error("Failed to fetch fairs and events:", error);
    return { isOk: false, data: [], message: "Failed to fetch events." };
  }
}

// 2. Service to get a SINGLE Fair or Viewing Room (with Redis Artworks)
export async function getIndividualFairOrEventService(eventId: string) {
  try {
    const eventData = await GalleryEvent.aggregate([
      {
        $match: {
          event_id: eventId,
          is_published: true,
          event_type: { $in: ["art_fair", "viewing_room"] },
        },
      },
      {
        $lookup: {
          from: "accountgalleries",
          localField: "gallery_id",
          foreignField: "gallery_id",
          as: "gallery_data",
        },
      },
      { $unwind: { path: "$gallery_data", preserveNullAndEmptyArrays: true } },
    ]);

    if (!eventData || eventData.length === 0) {
      return { isOk: false, message: "Event not found." };
    }

    const event = eventData[0];

    // Fetch artworks perfectly ordered from Redis!
    const cachedArtworksStrings = await Promise.all(
      event.featured_artworks.map((id: string) => redis.get(`artwork:${id}`)),
    );

    const sortedArtworks = cachedArtworksStrings
      .map((artData) => {
        if (!artData) return null;
        if (typeof artData === "object") return artData;
        try {
          return JSON.parse(artData as string);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    const payload = {
      ...event,
      gallery: {
        name: event.gallery_data?.name,
        logo: event.gallery_data?.logo,
      },
      artworks: sortedArtworks,
    };

    delete payload.gallery_data;

    return { isOk: true, data: payload };
  } catch (error) {
    console.error("Error fetching single event details:", error);
    return { isOk: false, message: "Internal server error." };
  }
}
