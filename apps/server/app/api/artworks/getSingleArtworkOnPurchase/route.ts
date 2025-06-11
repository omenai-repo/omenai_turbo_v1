import { trimWhiteSpace } from "@omenai/shared-utils/src/trimWhitePace";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();

    const { title } = await request.json();
    const new_title = trimWhiteSpace(title);

    const artwork = await Artworkuploads.findOne(
      { title: new_title },
      "art_id author_id title artist pricing url availability role_access"
    ).exec();
    if (!artwork) throw new NotFoundError("Artwork not found");

    return NextResponse.json(
      {
        message: "Successful",
        data: artwork,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response!.message },
      { status: error_response!.status }
    );
  }
});
