import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const POST = withRateLimitHighlightAndCsrf(lenientRateLimit)(
  async function POST(request: Request) {
    const PAGE_SIZE = 30;
    try {
      await connectMongoDB();
      const { page = 1, artist } = await request.json();
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
        artist,
      })
        .skip(skip)
        .limit(PAGE_SIZE)
        .sort({ createdAt: -1 })
        .exec();

      return NextResponse.json(
        {
          message: "Successful",
          data: allArtworks,
        },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);

      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
// impressions: { $gt: 0 },
//       .sort({
//   impressions: -1,
// });
