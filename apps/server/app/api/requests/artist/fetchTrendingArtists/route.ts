import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";

const config: CombinedConfig = {
  ...lenientRateLimit,
};

export const GET = withRateLimitHighlightAndCsrf(config)(async function GET() {
  try {
    await connectMongoDB();

    const data = await Artworkuploads.aggregate([
      // Stage 1: Filter for artworks by artists only
      {
        $match: {
          "role_access.role": "artist",
        },
      },

      // Stage 2: Add a field for the count of likes per artwork
      {
        $addFields: {
          likeCount: { $size: "$like_IDs" },
        },
      },

      // Stage 3: Group by author_id to get total likes per artist and their most liked artwork
      {
        $group: {
          _id: "$author_id",
          artist: { $first: "$artist" }, // assuming artist field contains artist info
          artistLikes: { $sum: "$likeCount" },
          artworks: {
            $push: {
              artworkId: "$_id",
              likeCount: "$likeCount",
              title: "$title",
              url: "$url",
              createdAt: "$createdAt",
              birthyear: "$artist_birthyear",
              country: "$artist_country_origin",
            },
          },
        },
      },

      // Stage 4: Add the most liked artwork for each artist
      {
        $addFields: {
          mostLikedArtwork: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: "$artworks",
                  sortBy: { likeCount: -1 },
                },
              },
              0,
            ],
          },
        },
      },

      // Stage 5: Add a stage to get the total likes across all artists
      {
        $group: {
          _id: null,
          artists: {
            $push: {
              author_id: "$_id",
              artist: "$artist",
              artistLikes: "$artistLikes",
              mostLikedArtwork: "$mostLikedArtwork",
            },
          },
          totalLikes: { $sum: "$artistLikes" },
        },
      },

      // Stage 6: Unwind the artists array to work with individual artists
      {
        $unwind: "$artists",
      },

      // Stage 7: Calculate percentage safely (avoid divide by zero)
      {
        $addFields: {
          likePercentage: {
            $cond: [
              { $eq: ["$totalLikes", 0] }, // if no likes at all
              0, // fallback percentage
              {
                $multiply: [
                  { $divide: ["$artists.artistLikes", "$totalLikes"] },
                  100,
                ],
              },
            ],
          },
        },
      },

      // Stage 8: Filter for trending artists (2%+ of total likes)
      {
        $match: {
          likePercentage: { $gte: 2 },
        },
      },

      // Stage 9: Project the final result and sort by percentage (trending order)
      {
        $project: {
          _id: 0,
          author_id: "$artists.author_id",
          birthyear: "$artists.artist_birthyear",
          artistCountry: "$artists.artist_country_origin",
          artist: "$artists.artist",
          totalLikes: "$artists.artistLikes",
          likePercentage: { $round: ["$likePercentage", 2] },
          mostLikedArtwork: "$artists.mostLikedArtwork",
        },
      },

      // Stage 10: Sort by like percentage (most trending first)
      {
        $sort: { likePercentage: -1 },
      },
    ]);

    return NextResponse.json({ message: "Trending artist retrieved", data });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
