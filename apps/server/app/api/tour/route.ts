import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../util";
import { redis } from "@omenai/upstash-config";

export const GET = withRateLimit(lenientRateLimit)(async function GET(
  request: Request
) {
  const url = request.url;
  const id = new URL(url).searchParams.get("id");
  try {
    let toursData: string[] = [];
    try {
      const storedTours = await redis.smembers(`tours:${id}`);

      toursData =
        typeof storedTours === "string" ? JSON.parse(storedTours) : storedTours;
    } catch (error) {
      createErrorRollbarReport("Tours: Unable to fetch tours data", error, 500);
    }

    return NextResponse.json({
      message: "Tours list fetched",
      completedTours: toursData,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "transactions: create transaction",
      error,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
