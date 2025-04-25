import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { id } = await request.json();

    const allArtworks = await Artworkuploads.find(
      { author_id: id },
      "artist title url art_id like_IDs pricing availability"
    ).exec();

    const allArtworksCount = await Artworkuploads.countDocuments({
      author_id: id,
    });
    return NextResponse.json(
      {
        message: "Successful",
        data: allArtworks,
        count: allArtworksCount,
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
