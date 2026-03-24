import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

const config: CombinedConfig = {
  ...lenientRateLimit,
  allowedRoles: ["user"],
};
const updateArtworkAvailabilitySchema = z.object({
  art_id: z.string().min(1),
  entity_id: z.string().min(1),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const { art_id, entity_id } = await validateRequestBody(
      request,
      updateArtworkAvailabilitySchema,
    );

    const updateImpression = await Artworkuploads.updateOne(
      { art_id, author_id: entity_id },
      { $set: { availability: false } },
    );
    if (updateImpression.matchedCount === 0) {
      return NextResponse.json(
        { message: "Artwork not found" },
        { status: 404 },
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
