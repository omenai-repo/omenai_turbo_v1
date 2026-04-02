import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { CombinedConfig } from "@omenai/shared-types";
import z from "zod";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};

const FetchWaitlistUserSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(20),
});

export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  request: Request,
) {
  try {
    // Get entity from query parameters
    const { searchParams } = new URL(request.url);
    const pageParams = searchParams.get("page") ?? "1";
    const limitParams = searchParams.get("limit") ?? "20";

    // Validate entity parameter
    const { page, limit } = validateGetRouteParams(FetchWaitlistUserSchema, {
      page: Number(pageParams),
      limit: Number(limitParams),
    });
    await connectMongoDB();
    const collectors = await AccountIndividual.find(
      { verified: true },
      "user_id name email",
    )
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCollectors = await AccountIndividual.countDocuments({
      verified: true,
    });
    const totalPages = Math.ceil(totalCollectors / limit);
    return NextResponse.json(
      {
        message: "Successfully fetched all collectors",
        data: collectors,
        total: totalCollectors,
        pages: totalPages,
        page: page,
        limit: limit,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "admin: fetch waitlist user",
      error,
      error_response?.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
