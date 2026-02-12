import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NotFoundError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { NextRequest, NextResponse } from "next/server";
import {
  createErrorRollbarReport,
  validateGetRouteParams,
} from "../../../util";
import z from "zod";
const VerifyOnboardingSchema = z.object({
  artist_id: z.string(),
});
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  try {
    const { artist_id } = validateGetRouteParams(VerifyOnboardingSchema, {
      artist_id: id,
    });
    await connectMongoDB();

    const isCompleted = await AccountArtist.findOne<ArtistSchemaTypes>(
      {
        artist_id,
      },
      "isOnboardingCompleted artist_verified",
    ).exec();

    if (!isCompleted) throw new NotFoundError("Gallery data not found");

    return NextResponse.json(
      {
        message: "Verify Onboarding status",
        isOnboardingCompleted: isCompleted.isOnboardingCompleted,
        isArtistVerified: isCompleted.artist_verified,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artist: verify onboarding completion",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
}
