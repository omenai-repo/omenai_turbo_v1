import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";
import {
  ServerError,
  ServiceUnavailableError,
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
const UpdateSubsSchema = z.object({
  gallery_id: z.string(),
  action: z.string(),
  data: z.any(),
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
      throw new ServiceUnavailableError("Subscriptions are currently disabled");
    await connectMongoDB();
    const { data, gallery_id, action } = await validateRequestBody(
      request,
      UpdateSubsSchema,
    );

    const current_plan = await Subscriptions.findOne(
      {
        "customer.gallery_id": gallery_id,
      },
      "status",
    );

    const updateFuturePlan = await Subscriptions.updateOne(
      { "customer.gallery_id": gallery_id },
      {
        $set: {
          next_charge_params: data,
          status: action === "reactivation" ? "active" : current_plan.status,
        },
      },
    );

    if (!updateFuturePlan)
      throw new ServerError("Something went wrong, contact tech team");

    return NextResponse.json(
      { message: "Successful", data: updateFuturePlan },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "subscription: update subscription plan",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
