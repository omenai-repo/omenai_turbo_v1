import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

export async function getGalleryShowsService(
  gallery_id: string,
  page: number = 1,
  limit: number = 12,
) {
  try {
    const skip = (page - 1) * limit;

    const query = {
      gallery_id,
      is_published: true,
      is_archived: false,
    };

    const [totalShows, shows] = await Promise.all([
      GalleryEvent.countDocuments(query),
      GalleryEvent.find(query)
        .sort({ start_date: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .select(
          "event_id title event_type cover_image start_date end_date location",
        )
        .lean(),
    ]);

    const totalPages = Math.ceil(totalShows / limit);

    return {
      isOk: true,
      data: shows,
      pagination: {
        page,
        limit,
        total: totalShows,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Gallery Shows Error:", error);
    return { isOk: false, message: "Internal Server Error" };
  }
}
