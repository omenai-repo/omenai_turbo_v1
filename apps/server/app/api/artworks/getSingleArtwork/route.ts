import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { redis } from "@omenai/upstash-config";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { title } = await request.json();
    const sanitizedTitle = slugify(title);
    const cacheKey = `artwork:${sanitizedTitle}`;
    const TTL_SECONDS = 86400;

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

        const artwork = await Artworkuploads.findOne({ title }).lean().exec();
        if (!artwork) throw new NotFoundError("Artwork not found");

        artworkJsonData = artwork;

        try {
          await redis.set(cacheKey, JSON.stringify(artwork), {
            ex: TTL_SECONDS,
          });
        } catch (redisWriteErr) {
          console.error(`Redis Write Error [${cacheKey}]:`, redisWriteErr);
        }
      }
    } catch (redisReadErr) {
      console.error(`Redis Read Error [${cacheKey}]:`, redisReadErr);

      const artwork = await Artworkuploads.findOne({ title }).lean().exec();
      if (!artwork) throw new NotFoundError("Artwork not found");

      artworkJsonData = artwork;
    }

    return NextResponse.json(
      { message: "Successful", data: artworkJsonData },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error("Error in artwork fetch route:", error);

    return NextResponse.json(
      { message: error_response?.message ?? "Unknown error occurred" },
      { status: error_response?.status ?? 500 }
    );
  }
});

/**
 * Sanitizes a title string into a Redis-safe slug.
 */
export function slugify(title: string): string {
  if (!title) return "";
  return title
    .trim()
    .toLowerCase()
    .replace(/\W+/g, "-")
    .replace(/_/g, "-")
    .replace(/^-+|-+$/g, "");
}
