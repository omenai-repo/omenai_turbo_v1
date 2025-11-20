import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  NotFoundError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ArtistSchemaTypes, GallerySchemaTypes } from "@omenai/shared-types";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { createErrorRollbarReport } from "../../../util";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gallery_id = searchParams.get("id");

  try {
    if (!gallery_id || typeof gallery_id !== "string")
      throw new BadRequestError("Invalid ID parameter provided");
    await connectMongoDB();

    const gallery = await AccountGallery.findOne<GallerySchemaTypes>({
      gallery_id,
    }).exec();

    if (!gallery) throw new NotFoundError("Gallery data not found");

    const { name, logo, address, email, description, admin } = gallery;

    const payload = {
      name,
      logo,
      email,
      address,
      description,
      admin,
    };
    return NextResponse.json(
      {
        message: "Profile retrieved successfully",
        gallery: payload,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "gallery: fetch profile",
      error as any,
      error_response.status
    );
    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
