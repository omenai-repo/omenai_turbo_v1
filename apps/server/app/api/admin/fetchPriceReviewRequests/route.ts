import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { PriceReview } from "@omenai/shared-models/models/artworks/ArtworkPriceReviewSchema";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Owner", "Admin"],
};
export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  request: Request,
) {
  try {
    const { searchParams } = new URL(request.url);
    const statusQuery = searchParams.get("status");
    const searchArtistId = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    let dbQuery: any = {};

    // Allow admins to filter by a specific artist if they want
    if (searchArtistId) {
      dbQuery.artist_id = searchArtistId;
    }

    // Power the Admin Triage Tabs
    if (statusQuery) {
      if (statusQuery.includes(",")) {
        dbQuery.status = { $in: statusQuery.split(",") };
      } else {
        dbQuery.status = statusQuery;
      }
    }

    const reviews = await PriceReview.find(dbQuery)
      .sort({ createdAt: -1 }) // Oldest first might actually be better for admin triage (first in, first out)
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
