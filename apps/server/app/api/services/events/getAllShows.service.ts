import { GalleryEvent } from "@omenai/shared-models/models/events/GalleryEventSchema";

export async function getAllShowsService() {
  try {
    const shows = await GalleryEvent.aggregate([
      {
        $match: {
          is_published: true,
          is_archived: false,
          event_type: "exhibition",
        },
      },
      { $sort: { start_date: -1 } }, // Newest first
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
          location: 1,
          "gallery.name": "$gallery_data.name",
        },
      },
    ]);

    return { isOk: true, data: shows };
  } catch (error) {
    console.error("Failed to fetch all shows:", error);
    return { isOk: false, data: [], message: "Failed to fetch shows." };
  }
}
