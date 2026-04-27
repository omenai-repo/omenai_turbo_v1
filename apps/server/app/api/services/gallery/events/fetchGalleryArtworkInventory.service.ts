import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../../artworks/utils";

export async function fetchAvailableInventory(
  gallery_id: string,
  page: number = 1,
  limit: number = 20,
  search_term: string = "",
) {
  try {
    const skip = (page - 1) * limit;

    // 1. Build the base query: Belongs to gallery AND is not locked in an event
    const query: any = {
      author_id: gallery_id,
      availability: true,
      $or: [
        { exhibition_status: null },
        { "exhibition_status.status": "pending" },
      ],
    };

    // 2. Add search filter if the user typed something in the modal
    if (search_term) {
      query.$or = [
        ...query.$or,
        // Assuming your DB uses these fields. We use regex for partial matching.
        { title: { $regex: search_term, $options: "i" } },
        { artist: { $regex: search_term, $options: "i" } },
      ];
    }

    // 3. Fetch ONLY the paginated/filtered IDs
    const availableArtworkDocs = await Artworkuploads.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("art_id")
      .lean()
      .exec();

    // Also get the total count so the frontend knows if there are more pages
    const totalCount = await Artworkuploads.countDocuments(query);
    const hasMore = totalCount > skip + availableArtworkDocs.length;

    const artIds = availableArtworkDocs.map((a) => a.art_id);

    // 4. Fetch the rich data from Redis
    const availableArtworks = await fetchArtworksFromCache(artIds);

    return {
      isOk: true,
      data: availableArtworks,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore,
      },
    };
  } catch (error) {
    console.error("Error fetching available inventory:", error);
    return {
      isOk: false,
      message: "Failed to load inventory.",
      data: [],
      pagination: null,
    };
  }
}
