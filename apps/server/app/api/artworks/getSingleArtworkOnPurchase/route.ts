import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { getCachedArtwork } from "../utils";
import { createErrorRollbarReport } from "../../util";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { art_id } = await request.json();

    const artwork = await getCachedArtwork(art_id);

    return NextResponse.json(
      {
        message: "Successful",
        data: artwork,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artwork: get single Artwork on purchase",
      error as any,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response!.message },
      { status: error_response!.status }
    );
  }
});
