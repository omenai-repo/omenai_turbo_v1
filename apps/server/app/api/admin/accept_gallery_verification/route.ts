import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { sendGalleryAcceptedMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryAcceptedMail";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const { gallery_id, name, email } = await request.json();

    const verify_gallery = await AccountGallery.updateOne(
      { gallery_id },
      { $set: { gallery_verified: true } }
    );

    if (!verify_gallery) throw new ServerError("Something went wrong");

    // TODO: Send mail to gallery
    sendGalleryAcceptedMail({
      name,
      email,
    });

    return NextResponse.json(
      { message: "Gallery verification accepted" },
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
