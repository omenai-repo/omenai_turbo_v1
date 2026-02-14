import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
const CancelSubscriptionSchema = z.object({
  gallery_id: z.string(),
});
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const isSubscriptionEnabled = (await fetchConfigCatValue(
      "subscription_creation_enabled",
      "high",
    )) as boolean;

    if (!isSubscriptionEnabled)
      throw new ForbiddenError("Subscriptions are currently disabled");

    await connectMongoDB();
    const { gallery_id } = await validateRequestBody(
      request,
      CancelSubscriptionSchema,
    );

    const cancel_subscription = await Subscriptions.updateOne(
      { "customer.gallery_id": gallery_id },
      { $set: { status: "canceled" } },
    );

    if (!cancel_subscription)
      throw new ServerError("An error has occured, please try again");
    return NextResponse.json(
      { message: "Subscription has been canceled" },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "subscription: cancel subscription",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
