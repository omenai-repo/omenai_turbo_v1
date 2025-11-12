import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { buildMongoQuery } from "@omenai/shared-utils/src/buildMongoFilterQuery";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { fetchArtworksFromCache, getCachedGalleryIds } from "../utils";
export const revalidate = 0;
export const dynamic = "force-dynamic";

export const POST = withRateLimit(lenientRateLimit)(async function POST(
  request: Request
) {
  const PAGE_SIZE = 30;
  try {
    await connectMongoDB();

    const { page, preferences, filters } = await request.json();
    const skip = (page - 1) * PAGE_SIZE;

    const galleries = await getCachedGalleryIds();

    // Build filters for artworks
    const builtFilters = buildMongoQuery(filters);

    // Handle the case where builtFilters might be an empty object
    const filterCriteria =
      Object.keys(builtFilters).length > 0 ? builtFilters : {};

    const allArtworksIds = await Artworkuploads.find({
      $or: [
        { "role_access.role": "artist" },
        { "role_access.role": "gallery", author_id: { $in: [...galleries] } },
      ],
      ...filterCriteria,
      medium: { $in: preferences },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .select("art_id")
      .lean()
      .exec();

    const artIds = allArtworksIds.map((a) => a.art_id);

    const allArtworks = await fetchArtworksFromCache(artIds);

    // Calculate total adhering to restrictions
    const total = await Artworkuploads.countDocuments({
      ...builtFilters,
      $or: [
        // Condition for artworks by artists
        { "role_access.role": "artist" },

        // Condition for artworks by galleries meeting the specified criteria
        {
          "role_access.role": "gallery",
          author_id: { $in: [...galleries] },
        },
      ],
      medium: { $in: preferences },
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

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
// medium: { $in: preferences },
