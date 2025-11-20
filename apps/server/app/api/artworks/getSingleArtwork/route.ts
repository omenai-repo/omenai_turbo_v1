import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { redis } from "@omenai/upstash-config";
import { getCachedArtwork } from "../utils";
import { createErrorRollbarReport } from "../../util";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { art_id } = await request.json();
    console.log(art_id);
    const artwork = await getCachedArtwork(art_id);

    return NextResponse.json(
      { message: "Successful", data: artwork },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error("Error in artwork fetch route:", error);
    createErrorRollbarReport(
      "artwork: get single Artwork",
      error as any,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message ?? "Unknown error occurred" },
      { status: error_response?.status ?? 500 }
    );
  }
});
