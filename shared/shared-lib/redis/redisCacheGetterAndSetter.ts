import { redis } from "@omenai/upstash-config";

export async function getSetCacheData(
  key: string,
  fetcher: () => Promise<any>,
  TTL: number
): Promise<any> {
  // 1. READ (Check the Cache)
  const cachedData = await redis.get(key);

  if (cachedData) {
    // CACHE HIT: Return the data instantly
    console.log(`Cache Hit for key: ${key}`);
    // Upstash often returns JSON objects as strings, so you may need to parse it.
    return JSON.parse(cachedData as string);
  }

  // CACHE MISS: Proceed to fetch from the primary source
  console.log(`Cache Miss for key: ${key}. Fetching from external source.`);

  // 2. WRITE (Fetch from Primary Source)
  const freshData = await fetcher();

  if (freshData) {
    // 3. ⏳ EXPIRE (Set the Cache)
    // Store the fresh data as a string (using JSON.stringify) with a Time-To-Live (TTL)
    await redis.set(key, JSON.stringify(freshData), {
      ex: TTL, // Set expiration time
    });
  }

  return freshData;
}

function get<T>() {}
