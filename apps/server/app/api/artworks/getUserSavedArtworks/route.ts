import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { fetchArtworksFromCache, getCachedGalleryIds } from "../utils";
import { createErrorRollbarReport } from "../../util";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  const PAGE_SIZE = 30;

  try {
    await connectMongoDB();

    const { id, page } = await request.json();
    const skip = (page - 1) * PAGE_SIZE;

    const galleries = await getCachedGalleryIds();

    const allArtworksIds = await Artworkuploads.find({
      like_IDs: { $in: [id] },
      $or: [
        { "role_access.role": "artist" },
        { "role_access.role": "gallery", author_id: { $in: [...galleries] } },
      ],
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
      $or: [
        // Condition for artworks by artists
        { "role_access.role": "artist" },

        // Condition for artworks by galleries meeting the specified criteria
        {
          "role_access.role": "gallery",
          author_id: { $in: [...galleries] },
        },
      ],
    });

    return NextResponse.json(
      {
        message: "Successful",
        data: allArtworks,
        pageCount: Math.ceil(total / PAGE_SIZE),
        total,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artwork: get user saved Artwork",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
// medium: { $in: preferences },
