import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { RecentView } from "@omenai/shared-models/models/artworks/RecentlyViewed";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import { createErrorRollbarReport } from "../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();

    const { user_id } = await request.json();

    const recentlyViewed = await RecentView.find({ user: user_id })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    return NextResponse.json(
      {
        message: "Successful",
        data: recentlyViewed,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "viewHistory: get view history",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
