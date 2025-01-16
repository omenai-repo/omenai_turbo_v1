import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { buildMongoQuery } from "@omenai/shared-utils/src/buildMongoFilterQuery";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const PAGE_SIZE = 30;
  const BASIC_LIMIT = 25;
  try {
    await connectMongoDB();
    const { page, medium, filters } = await request.json();
    const skip = (page - 1) * PAGE_SIZE;

    // Helper function to fetch gallery IDs based on subscription plan
    const getGalleryIdsByPlan = async (plan: string | string[]) => {
      const result = await Subscriptions.aggregate([
        {
          $match: {
            "plan_details.type": { $in: Array.isArray(plan) ? plan : [plan] },
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
    const [basicGalleryIds, proPremiumGalleryIds] = await Promise.all([
      getGalleryIdsByPlan("Basic"),
      getGalleryIdsByPlan(["Pro", "Premium"]),
    ]);

    // Build filters for artworks
    const builtFilters = buildMongoQuery(filters);

    // Handle the case where builtFilters might be an empty object
    const filterCriteria =
      Object.keys(builtFilters).length > 0 ? builtFilters : {};

    // Fetch all filtered artworks, sorted by creation date
    const allArtworks = await Artworkuploads.find({
      ...filterCriteria,
      $or: [
        // Condition for artworks by artists
        { "role_access.role": "artist" },

        // Condition for artworks by galleries meeting the specified criteria
        {
          "role_access.role": "gallery",
          author_id: { $in: [...basicGalleryIds, ...proPremiumGalleryIds] },
        },
      ],
      medium,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .exec();

    // Separate artworks into basic and pro/premium based on gallery_id
    let selectedBasicArtworks = [];
    let selectedProPremiumArtworks = [];
    let artworksByArtist = [];

    for (let artwork of allArtworks) {
      if (artwork.role_access.role === "artist") {
        artworksByArtist.push(artwork);
      } else if (basicGalleryIds.includes(artwork.author_id)) {
        if (selectedBasicArtworks.length < BASIC_LIMIT) {
          selectedBasicArtworks.push(artwork);
        }
      } else {
        selectedProPremiumArtworks.push(artwork);
      }
    }

    // Combine and slice the artworks for pagination
    const allArtworksByCriteria = [
      ...selectedBasicArtworks,
      ...artworksByArtist,
      ...selectedProPremiumArtworks,
    ].slice(0, PAGE_SIZE);

    // Calculate total adhering to restrictions
    const total = await Artworkuploads.countDocuments({
      ...builtFilters,
      $or: [
        // Condition for artworks by artists
        { "role_access.role": "artist" },

        // Condition for artworks by galleries meeting the specified criteria
        {
          "role_access.role": "gallery",
          author_id: { $in: [...basicGalleryIds, ...proPremiumGalleryIds] },
        },
      ],
      medium,
    });

    return NextResponse.json(
      {
        message: "Successful",
        data: allArtworksByCriteria,
        page,
        pageCount: Math.ceil(total / PAGE_SIZE),
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
// impressions: { $gt: 0 },
//       .sort({
//   impressions: -1,
// });
