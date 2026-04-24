import { redis } from "@omenai/upstash-config"; // Adjust to your Upstash export
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const searchParams = new URL(request.url).searchParams;
  const type = (searchParams.get("type") ?? "") as
    | "curator_picks"
    | "featured_feed";
  try {
    if (!type) return NextResponse.json({ data: [] });

    const response = await getCuratedFeed(type);

    return NextResponse.json({ data: response });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Curations: Fetch curated data",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});

async function getCuratedFeed(curationType: "curator_picks" | "featured_feed") {
  try {
    const data = await redis.get(`homepage:${curationType}`);

    if (!data) return [];

    // Depending on your Redis client, it might return a string or an already parsed object
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (error) {
    console.error(`Error fetching ${curationType} from Redis:`, error);
    return []; // Return empty array on failure so the UI doesn't crash
  }
}
