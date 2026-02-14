import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import z from "zod";
const Schema = z.object({
  id: z.string().min(1),
});
export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const { id } = await validateRequestBody(request, Schema);

    const foundImpression = await Artworkuploads.findOne(
      { art_id: id },
      "like_IDs",
    ).lean();

    if (!foundImpression)
      throw new ServerError("An unexpected error has occured.");

    return NextResponse.json(
      {
        message: "arwork found",
        data: foundImpression,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artwork: get single Artwork impression",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
