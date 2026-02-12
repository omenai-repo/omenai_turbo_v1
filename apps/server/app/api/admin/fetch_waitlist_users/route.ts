import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";
import { CombinedConfig } from "@omenai/shared-types";
import z from "zod";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["admin"],
  allowedAdminAccessRoles: ["Admin", "Owner"],
};

const FetchWaitlistUserSchema = z.object({
  entity: z.enum(["gallery, artist"]),
});

export const GET = withRateLimitHighlightAndCsrf(config)(async function GET(
  request: Request,
) {
  try {
    // Get entity from query parameters
    const { searchParams } = new URL(request.url);
    const entityParams = searchParams.get("entity");

    // Validate entity parameter
    const { entity } = validateGetRouteParams(FetchWaitlistUserSchema, {
      entity: entityParams,
    });
    await connectMongoDB();
    const waitlistUser = await Waitlist.find({
      isInvited: false,
      entity,
    });

    return NextResponse.json(
      {
        message: "Successfully fetched all waitlist users",
        data: waitlistUser,
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
