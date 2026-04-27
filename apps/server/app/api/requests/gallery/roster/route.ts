// src/app/api/galleries/roster/route.ts
import { NextResponse } from "next/server";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { fetchGalleryRosterLogic } from "../../../services/gallery/events/fetchGalleryRoster.service";
import { createErrorRollbarReport } from "../../../util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};

export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  request: Request,
) {
  try {
    // Assuming you pass gallery_id as a query parameter: /api/galleries/roster?gallery_id=gal_123...
    // Alternatively, pull this from your decoded auth session!
    const { searchParams } = new URL(request.url);
    const gallery_id = searchParams.get("gallery_id");

    await connectMongoDB();
    const result = await fetchGalleryRosterLogic(gallery_id);

    return NextResponse.json(
      { message: result.message, roster: result.roster },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "roster: fetch roster",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
