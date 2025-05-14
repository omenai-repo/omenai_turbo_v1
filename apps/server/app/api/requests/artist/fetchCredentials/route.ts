import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import { NotFoundError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist_id = searchParams.get("id");
  try {
    await connectMongoDB();
    const credentials = await ArtistCategorization.findOne(
      { artist_id },
      "current"
    );

    if (!credentials)
      throw new NotFoundError(
        "No credentials were found for this artist id. Try again or contact support"
      );

    return NextResponse.json(
      {
        message: "Credentials retrieved successfully",
        credentials: credentials.current,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
