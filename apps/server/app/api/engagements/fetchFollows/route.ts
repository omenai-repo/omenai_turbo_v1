import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { Follow } from "@omenai/shared-models/models/follows/FollowSchema";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const searchParams = new URL(request.url).searchParams;
  const user_id = searchParams.get("id") ?? "";

  // Early return if no ID is provided, saving a database trip
  if (!user_id) {
    return NextResponse.json({ followedIds: [] }, { status: 200 });
  }

  try {
    await connectMongoDB();

    const follows = await Follow.find({ follower: user_id })
      .select("followingId -_id")
      .lean();

    // Map the array of objects into a flat array of UUID strings
    const followedIds = follows.map((follow: any) => follow.followingId);

    return NextResponse.json({ followedIds }, { status: 200 });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "Follows: fetch following ids", // Updated the Rollbar context string
      error,
      error_response.status,
    );

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
