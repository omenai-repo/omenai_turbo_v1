import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const { id, url } = await request.json();

    const updateLogo = await AccountGallery.updateOne(
      { gallery_id: id },
      { $set: { logo: url } }
    );

    return NextResponse.json(
      {
        message: "Logo updated",
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
