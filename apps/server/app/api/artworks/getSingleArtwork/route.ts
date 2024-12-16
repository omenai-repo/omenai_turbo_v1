import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { title } = await request.json();
    console.log(title);

    const artwork = await Artworkuploads.findOne({ title }).exec();
    if (!artwork) throw new NotFoundError("Artwork not found");

    console.log("artwork");

    return NextResponse.json(
      {
        message: "Successful",
        data: artwork,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);
    return NextResponse.json(
      { message: error_response!.message },
      { status: error_response!.status }
    );
  }
}
