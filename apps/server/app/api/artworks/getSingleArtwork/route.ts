import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { getCachedArtwork } from "../utils";
import { createErrorRollbarReport } from "../../util";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";

export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const { art_id } = await request.json();
    const artwork = await getCachedArtwork(art_id);

    return NextResponse.json(
      { message: "Successful", data: artwork },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error("Error in artwork fetch route:", error);
    createErrorRollbarReport(
      "artwork: get single Artwork",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message ?? "Unknown error occurred" },
      { status: error_response?.status ?? 500 },
    );
  }
});
