import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  NotFoundError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ArtistSchemaTypes, GallerySchemaTypes } from "@omenai/shared-types";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { NextRequest, NextResponse } from "next/server";
import { createErrorRollbarReport } from "../../../util";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist_id = searchParams.get("id");

  try {
    if (!artist_id || typeof artist_id !== "string")
      throw new BadRequestError("Invalid ID parameter provided");
    await connectMongoDB();

    const isCompleted = await AccountArtist.findOne<ArtistSchemaTypes>(
      {
        artist_id,
      },
      "isOnboardingCompleted artist_verified"
    ).exec();

    if (!isCompleted) throw new NotFoundError("Gallery data not found");

    return NextResponse.json(
      {
        message: "Verify Onboarding status",
        isOnboardingCompleted: isCompleted.isOnboardingCompleted,
        isArtistVerified: isCompleted.artist_verified,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artist: verify onboarding completion",
      error,
      error_response.status
    );
    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
