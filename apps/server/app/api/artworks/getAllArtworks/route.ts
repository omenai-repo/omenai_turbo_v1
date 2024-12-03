import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { page } = await request.json();

    const skip = (page - 1) * 10;

    const allArtworks = await Artworkuploads.find().skip(skip).limit(30).sort({
      createdAt: -1,
    });

    if (!allArtworks) throw new ServerError("An error was encountered");

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
