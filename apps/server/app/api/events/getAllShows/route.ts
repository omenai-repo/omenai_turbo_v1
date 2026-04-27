import {
  lenientRateLimit,
  standardRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { getFeaturedShowsCarousel } from "../../services/events/getFeaturedShows.service";
import { getAllShowsService } from "../../services/events/getAllShows.service";

export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  try {
    await connectMongoDB();
    const shows = await getAllShowsService();
    return NextResponse.json({ shows: shows.data });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport("exchange rate", error, error_response.status);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
