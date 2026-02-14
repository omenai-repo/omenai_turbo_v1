import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CombinedConfig } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist", "gallery"],
};

const UpdateArtworkDataSchema = z.object({
  filter: z.any(),
  art_id: z.string().min(1),
});

export const POST = withRateLimitHighlightAndCsrf(config)(async function PUT(
  request: Request,
) {
  try {
    await connectMongoDB();

    const data = await validateRequestBody(request, UpdateArtworkDataSchema);

    const updateArtworkPrice = await Artworkuploads.updateOne(
      { art_id: data.art_id },
      { $set: { ...data.filter } },
    );

    if (updateArtworkPrice.modifiedCount === 0)
      throw new ServerError(
        "Request could not be completed at this time. Please contact support",
      );

    return NextResponse.json(
      {
        message: "Successfully updated artwork data",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artwork: update Artwork data",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
