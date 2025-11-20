import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { createErrorRollbarReport } from "../../util";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { id } = await request.json();

    const popular_artworks = await Artworkuploads.find({ author_id: id })
      .sort({
        impressions: -1,
      })
      .limit(3)
      .lean()
      .exec();

    if (!popular_artworks)
      throw new ServerError("An eunexpected error has occured.");

    const filter_popular_artworks = popular_artworks.filter((art) => {
      return art.impressions > 0;
    });

    return NextResponse.json(
      {
        message: "Successful",
        data: filter_popular_artworks,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artwork: get popular Artwork",
      error as any,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
