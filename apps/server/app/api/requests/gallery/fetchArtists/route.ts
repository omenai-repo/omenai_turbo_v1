// /src/app/api/artists/search/route.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { CombinedConfig } from "@omenai/shared-types";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};
export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q");

    // 1. Clean the input: Remove accidental spaces at start/end
    const query = rawQuery?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    await connectMongoDB();

    // 2. Use a robust aggregation
    const artists = await AccountArtist.aggregate([
      {
        $match: {
          // Find the name regardless of existing status
          name: { $regex: query, $options: "i" },
        },
      },
      { $limit: 10 },
      {
        $lookup: {
          from: "accountgalleries", // DOUBLE CHECK: Is this your exact collection name in Compass?
          localField: "artist_id",
          foreignField: "represented_artists",
          as: "representation",
        },
      },
      // ... (rest of the route remains the same)

      {
        $project: {
          _id: 0,
          artist_id: 1,
          name: 1,
          profile_status: { $ifNull: ["$profile_status", "claimed"] },
          artist_verified: { $ifNull: ["$artist_verified", false] },
          logo: { $ifNull: ["$logo", ""] },

          // NEW: Include these for prepopulation
          birthyear: { $ifNull: ["$birthyear", ""] },
          country_of_origin: { $ifNull: ["$country_of_origin", ""] },

          location: {
            $cond: {
              if: { $and: ["$address.city", "$address.country"] },
              then: { $concat: ["$address.city", ", ", "$address.country"] },
              else: "Location unknown",
            },
          },
          represented_by: { $arrayElemAt: ["$representation.name", 0] },
        },
      },

      // ...
    ]);

    return NextResponse.json({ results: artists }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Search failed", error: error.message },
      { status: 500 },
    );
  }
});
