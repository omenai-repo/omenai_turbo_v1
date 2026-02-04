import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  CombinedConfig,
  SubscriptionModelSchemaTypes,
  SubscriptionPlanDataTypes,
  SubscriptionStatus,
} from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { createErrorRollbarReport } from "../../util";
import { BadRequestError } from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["gallery"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  const { email } = await request.json();
  try {
    if (!email)
      throw new BadRequestError(
        "Invalid data parameters provided. Please try again",
      );

    await connectMongoDB();

    const account = (await AccountGallery.findOne(
      { email },
      "email gallery_id subscription_status",
    )
      .lean()
      .select("email")) as {
      email: string;
      gallery_id: string;
      subscription_status: SubscriptionStatus;
    };

    if (!account)
      throw new BadRequestError("No gallery account found for this ID");

    const isDiscountActive = account.subscription_status.discount.active;
    return NextResponse.json({
      message: "Discount Data retrieved",
      discount: isDiscountActive,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Subscriptions: retrieve discount data",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
