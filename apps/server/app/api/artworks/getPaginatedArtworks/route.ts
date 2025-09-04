import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { buildMongoQuery } from "@omenai/shared-utils/src/buildMongoFilterQuery";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import {
  lenientRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function POST(request: Request) {
    const PAGE_SIZE = 30;

    try {
      await connectMongoDB();
      const { page, filters } = await request.json();
      const skip = (page - 1) * PAGE_SIZE;

      // Helper function to fetch gallery IDs based on subscription plan
      const getGalleryIds = async () => {
        const result = await Subscriptions.aggregate([
          {
            $match: {
              status: "active",
            },
          },
          {
            $group: {
              _id: null,
              galleryIds: { $addToSet: "$customer.gallery_id" },
            },
          },
        ]).exec();

        return result.length > 0 ? result[0].galleryIds : [];
      };

      // Fetch gallery IDs for basic and pro/premium plans
      const galleries = await getGalleryIds();

      // Build filters for artworks
      const builtFilters = buildMongoQuery(filters);

      // Handle the case where builtFilters might be an empty object
      const filterCriteria =
        Object.keys(builtFilters).length > 0 ? builtFilters : {};

      // Fetch all filtered artworks, sorted by creation date
      const allArtworks = await Artworkuploads.find({
        $or: [
          // Condition for artworks by artists
          { "role_access.role": "artist" },

          // Condition for artworks by galleries meeting the specified criteria
          {
            "role_access.role": "gallery",
            author_id: { $in: [...galleries] },
          },
        ],
        ...filterCriteria, // Apply any additional filters
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .exec();

      // Combine and slice the artworks for pagination

      // Calculate total adhering to restrictions
      const total = await Artworkuploads.countDocuments({
        $or: [
          // Condition for artworks by artists
          { "role_access.role": "artist" },

          // Condition for artworks by galleries meeting the specified criteria
          {
            "role_access.role": "gallery",
            author_id: { $in: [...galleries] },
          },
        ],
        ...builtFilters,
      });

      return NextResponse.json(
        {
          message: "Successful",
          data: allArtworks,
          page,
          pageCount: Math.ceil(total / PAGE_SIZE),
          total,
        },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      console.log(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
