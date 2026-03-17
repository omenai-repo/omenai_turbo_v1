import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["artist"],
};
export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  request: Request,
) {
  try {
    const { searchParams } = new URL(request.url);
    const statusQuery = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const artistId = searchParams.get("id");

    await connectMongoDB();
    const artist_id = await AccountArtist.exists({
      artist_id: artistId,
    }).exec();

    if (!artist_id) {
      return NextResponse.json(
        { message: "Unauthorized artist" },
        { status: 401 },
      );
    }

    // Hard-lock the query to this specific artist
    let dbQuery: any = { artist_id: artistId };

    if (statusQuery) {
      if (statusQuery.includes(",")) {
        dbQuery.status = { $in: statusQuery.split(",") };
      } else {
        dbQuery.status = statusQuery;
      }
    }

    const reviews = await PriceReview.find(dbQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalDocuments = await PriceReview.countDocuments(dbQuery);

    return NextResponse.json(
      {
        data: reviews,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(totalDocuments / limit),
          totalItems: totalDocuments,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});
