import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const data = await request.json();

    const updatedData = await AccountGallery.findOneAndUpdate(
      { gallery_id: data.id },
      { $set: { ...data } }
    );

    if (!updatedData) throw new ServerError("An unexpected error has occured.");

    return NextResponse.json(
      {
        message: "Profile data updated",
        data: updatedData,
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
