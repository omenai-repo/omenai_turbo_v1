import { NextResponse } from "next/server";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../../../custom/errors/handler/errorHandler";
import { addArtistToRosterLogic } from "../../../../services/gallery/events/addArtistToRoster.service";
import { createErrorRollbarReport } from "../../../../util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    // Extract gallery_id from the body (or from your session middleware if you attach it to the request)
    const { gallery_id, ...rawData } = body;
    await connectMongoDB();
    const result = await addArtistToRosterLogic(rawData, gallery_id);

    return NextResponse.json(
      { message: result.message, artist_id: result.artist_id },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "roster: add artist",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
