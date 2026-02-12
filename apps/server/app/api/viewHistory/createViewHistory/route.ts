import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";

import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

const config: CombinedConfig = {
  ...lenientRateLimit,
  allowedRoles: ["user"],
};
const Schema = z.object({
  artwork: z.string(),
  user_id: z.string(),
  art_id: z.string(),
  artist: z.string(),
  url: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const { artwork, user_id, art_id, artist, url } = await validateRequestBody(
      request,
      Schema,
    );
    await connectMongoDB();
    const checkIfViewed = await RecentView.findOne({
      art_id,
      user: user_id,
    });

    if (checkIfViewed) {
      return NextResponse.json({ status: 200 });
    }
    await RecentView.create({
      artwork,
      user: user_id,
      art_id,
      artist,
      url,
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "viewhistory: create view history",
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
