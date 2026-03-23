import { redis } from "@omenai/upstash-config";
import { NextResponse } from "next/server";

export async function deleteArtworkKeys() {
  let cursor = 0;
  let deleted = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: "artwork:*",
      count: 150,
    });

    cursor = Number(nextCursor);

    if (keys.length > 0) {
      deleted += await redis.del(...keys);
    }
  } while (cursor !== 0);

  return deleted;
}

export async function GET() {
  const deletedCount = await deleteArtworkKeys();
  console.log(`Deleted ${deletedCount} artwork keys`);
  return NextResponse.json({ message: "Active", deletedCount });
}
