import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import { redis } from "@omenai/upstash-config";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};
const CreateConnectedAccountSchema = z.object({
  customer: z.any(),
});

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();
    const { customer } = await validateRequestBody(
      request,
      CreateConnectedAccountSchema,
    );

    const account = await stripe.accounts.create({
      metadata: customer,
      email: customer.email,
      country: customer.country,
      controller: {
        stripe_dashboard: {
          type: "express",
        },
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
      },
      capabilities: {
        transfers: {
          requested: true,
        },
      },
      tos_acceptance: {
        service_agreement: customer.country === "US" ? null : "recipient",
      },
    });

    if (!account)
      throw new ServerError("Something went wrong. Contact Support");

    const update_connected_id = await AccountGallery.updateOne(
      {
        email: customer.email,
      },
      { $set: { connected_account_id: account.id } },
    );

    if (update_connected_id.modifiedCount === 0)
      throw new ServerError("Something went wrong. Contact Support");

    // Set cache

    try {
      const accountData = {
        connected_account_id: account.id,
        gallery_verified: true,
      };
      await redis.del(`accountId:${customer.customer_id}`);
      await redis.set(
        `accountId:${customer.customer_id}`,
        JSON.stringify(accountData),
      );
    } catch (error) {
      rollbarServerInstance.error({
        context: "Redis deletion: Connected account ID",
        error,
      });
    }
    return NextResponse.json(
      {
        message: "Connected account created",
        account_id: account.id,
      },
      { status: 201 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "stripe: create connected account",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
