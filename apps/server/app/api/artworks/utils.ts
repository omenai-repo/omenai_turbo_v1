import { redis } from "@omenai/upstash-config";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { NotFoundError } from "../../../custom/errors/dictionary/errorDictionary";

/**
 * Fetch artworks from Redis cache. Handles cache misses by fetching from MongoDB and rehydrating cache.
 * @param artIds Array of artwork IDs to fetch
 * @param TTL Cache TTL in seconds for rehydrated items (optional, default 1 day)
 * @returns Array of artwork objects in the same order as artIds
 */
export async function fetchArtworksFromCache(artIds: string[]) {
  if (artIds.length === 0) return [];

  // Generate Redis keys
  const keys = artIds.map((id) => `artwork:${id}`);

  // Fetch from cache
  const cachedArtworks = await redis.mget(...keys);

  const artworks: (any | null)[] = [];
  const missingIds: string[] = [];

  // Parse cached data and track misses
  cachedArtworks.forEach((art, index) => {
    if (art) {
      artworks[index] = typeof art === "string" ? JSON.parse(art) : art;
    } else {
      artworks[index] = null;
      missingIds.push(artIds[index]);
    }
  });

  // Handle cache misses
  if (missingIds.length > 0) {
    // Fetch missing artworks from MongoDB
    const missingDocs = await Artworkuploads.find({
      art_id: { $in: missingIds },
    })
      .lean()
      .exec();

    // Rehydrate cache and fill missing spots
    missingDocs.forEach((doc) => {
      const index = artIds.indexOf(doc.art_id);
      if (index !== -1) {
        artworks[index] = doc;
        redis
          .set(`artwork:${doc.art_id}`, JSON.stringify(doc))
          .catch((err) =>
            console.error(`Failed to set cache for artwork:${doc.art_id}`, err)
          );
      }
    });
  }

  return [...artworks].reverse();
}

// Helper function to fetch gallery IDs with caching
export async function getCachedGalleryIds() {
  const cacheKey = "activeGalleryIds";

  // Try fetching from cache first
  let galleries = await redis.get(cacheKey);

  if (galleries) {
    try {
      return typeof galleries === "string" ? JSON.parse(galleries) : galleries;
    } catch (err) {
      console.error("Failed to parse cached gallery IDs:", err);
    }
  }

  // If cache miss or parse error, fetch from DB
  const result = await Subscriptions.aggregate([
    { $match: { status: "active" } },
    {
      $group: { _id: null, galleryIds: { $addToSet: "$customer.gallery_id" } },
    },
  ]).exec();

  galleries = result.length > 0 ? result[0].galleryIds : [];

  // Store in cache with 1-hour TTL (3600 seconds)
  await redis
    .set(cacheKey, JSON.stringify(galleries), { ex: 3600 })
    .catch((err) => console.error("Failed to set gallery IDs cache:", err));

  return galleries;
}

export async function getCachedArtwork(art_id: string) {
  const cacheKey = `artwork:${art_id}`;

  let artworkJsonData: any;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`Cache Hit: ${cacheKey}`);

      try {
        artworkJsonData =
          typeof cached === "string" ? JSON.parse(cached) : cached;
      } catch (err) {
        console.error(`Error parsing cache value for ${cacheKey}:`, err);
      }
    }

    if (!artworkJsonData) {
      console.log(`Cache Miss: ${cacheKey}`);

      const artwork = await Artworkuploads.findOne({ art_id }).lean().exec();
      console.log(artwork, art_id);
      if (!artwork) throw new NotFoundError("Artwork not found");

      console.log(artwork);

      artworkJsonData = artwork;

      try {
        await redis.set(cacheKey, JSON.stringify(artwork));
      } catch (redisWriteErr) {
        console.error(`Redis Write Error [${cacheKey}]:`, redisWriteErr);
      }
    }
  } catch (redisReadErr) {
    console.error(`Redis Read Error [${cacheKey}]:`, redisReadErr);

    const artwork = await Artworkuploads.findOne({ art_id }).lean().exec();
    if (!artwork) throw new NotFoundError("Artwork not found");

    artworkJsonData = artwork;
  }

  return artworkJsonData;
}

export async function purgeArtworkCache() {
  let cursor = 0;

  do {
    const result = await redis.scan(cursor, {
      match: "artwork:*",
      count: 100,
    });

    cursor = Number(result[0]);

    if (result[1].length) {
      await redis.del(...result[1]);
    }
  } while (cursor !== 0);
}
