import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { createErrorRollbarReport } from "../util";
import { fetchArtworksFromCache } from "../artworks/utils";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { searchTerm } = await request.json();

    const regex = new RegExp(searchTerm, "i");

    const foundArtworks = await Artworkuploads.find({
      $or: [{ title: regex }, { artist: regex }],
    })
      .sort({ createdAt: -1 })
      .select("art_id")
      .lean()
      .exec();

    const artIds = foundArtworks.map((a) => a.art_id);

    const allFoundArtworks = await fetchArtworksFromCache(artIds);

    return NextResponse.json(
      {
        message: "Successful",
        data: allFoundArtworks,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("search", error, error_response.status);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
