import { NextResponse } from "next/server";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../../../custom/errors/handler/errorHandler";
import { removeArtistFromRosterLogic } from "../../../../services/gallery/events/removeArtistFromRoster.service";
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

    const { gallery_id, artist_id } = body;
    await connectMongoDB();
    const result = await removeArtistFromRosterLogic(artist_id, gallery_id);

    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "roster: remove artist",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
