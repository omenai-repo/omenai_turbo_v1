import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import {
  lenientRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...lenientRateLimit,
  allowedRoles: ["user"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const { id, value, like_id } = await request.json();

    const updateImpression = await Artworkuploads.updateOne(
      { art_id: id },
      { $inc: { impressions: value === true ? 1 : -1 } },
    );

    if (updateImpression.modifiedCount === 0)
      throw new ServerError("An unexpected error has occured.");

    if (value) {
      await Artworkuploads.updateOne(
        { art_id: id },
        { $push: { like_IDs: like_id } },
      );
    } else {
      await Artworkuploads.updateOne(
        { art_id: id },
        { $pull: { like_IDs: like_id } },
      );
    }

    return NextResponse.json(
      {
        message: "Successful",
        data: updateImpression,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "artwork: update artwork impression",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
