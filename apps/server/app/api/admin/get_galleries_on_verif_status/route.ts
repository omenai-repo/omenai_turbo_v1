import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const { status } = await request.json();
    const galleries = await AccountGallery.find(
      { gallery_verified: status, verified: true },
      "name location admin logo description email gallery_verified gallery_id status"
    );

    if (!galleries)
      throw new ServerError("Something went wrong, contact tech team");

    return NextResponse.json(
      { message: "Data retrieved", data: galleries },
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
