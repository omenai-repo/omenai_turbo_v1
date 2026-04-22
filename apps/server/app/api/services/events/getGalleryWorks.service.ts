// @omenai/shared-services/gallery/getGalleryWorks.ts

import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { fetchArtworksFromCache } from "../../artworks/utils";

export async function getGalleryWorksService(
  gallery_id: string,
  page: number = 1,
  limit: number = 20,
  filters: { artist?: string; medium?: string; price?: string } = {},
) {
  try {
    const skip = (page - 1) * limit;

    // 1. Build the dynamic query object
    // Base match: Artworks uploaded by this gallery
    const query: any = { author_id: gallery_id };

    if (filters.artist && filters.artist !== "All") {
      query.artist_id = filters.artist;
    }

    if (filters.medium && filters.medium !== "All") {
      query.medium = filters.medium;
    }

    // Apply Price Filtering Logic
    if (filters.price && filters.price !== "All") {
      if (filters.price === "Under 1000") {
        query["pricing.price"] = { $lt: 1000 };
      } else if (filters.price === "1000-5000") {
        query["pricing.price"] = { $gte: 1000, $lte: 5000 };
      } else if (filters.price === "5000-10000") {
        query["pricing.price"] = { $gte: 5000, $lte: 10000 };
      } else if (filters.price === "Over 10000") {
        query["pricing.price"] = { $gt: 10000 };
      }
    }

    // 2. Fetch data and count concurrently
    const [totalWorks, works] = await Promise.all([
      Artworkuploads.countDocuments(query),
      Artworkuploads.find(query)
        .sort({ createdAt: -1 })
        .select("art_id") // Only grab the ID to pass to Redis
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const artIds = works.map((a) => a.art_id);

    // 3. Hydrate the full objects from Redis cache
    const allWorks = await fetchArtworksFromCache(artIds);

    const totalPages = Math.ceil(totalWorks / limit);

    return {
      isOk: true,
      data: allWorks,
      pagination: {
        page,
        limit,
        total: totalWorks,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Gallery Works Error:", error);
    return { isOk: false, message: "Internal Server Error" };
  }
}
