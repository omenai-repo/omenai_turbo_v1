import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

export async function getFeaturedShowsCarousel() {
  try {
    const shows = await GalleryEvent.aggregate([
      // 1. Filter: Only live, non-archived events
      {
        $match: {
          is_published: true,
          is_archived: false,
          event_type: "exhibition",
        },
      },
      // 2. Sort: Newest first (based on start date)
      { $sort: { start_date: -1 } },
      // 3. Limit: Only grab 10 for the homepage carousel
      { $limit: 10 },
      // 4. Join: Look up the gallery by the string gallery_id
      {
        $lookup: {
          from: "accountgalleries", // Replace with your exact MongoDB collection name for galleries
          localField: "gallery_id",
          foreignField: "gallery_id",
          as: "gallery_data",
        },
      },
      // 5. Flatten the array created by $lookup
      {
        $unwind: {
          path: "$gallery_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 6. Project: Clean up the data, sending only what the frontend needs
      {
        $project: {
          _id: 0,
          event_id: 1,
          title: 1,
          event_type: 1,
          cover_image: 1,
          start_date: 1,
          end_date: 1,
          location: 1,
          "gallery.name": "$gallery_data.name",
          "gallery.logo": "$gallery_data.logo",
        },
      },
    ]);

    return { isOk: true, data: shows };
  } catch (error) {
    console.error("Failed to fetch featured shows:", error);
    return { isOk: false, data: [] };
  }
}
