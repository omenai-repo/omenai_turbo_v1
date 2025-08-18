import { Proration } from "@omenai/shared-models/models/prorations/ProrationSchemaModel";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { dashboard_url, getApiUrl } from "@omenai/url-config/src/config";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const data = await request.json();

    const prorationValue = await Proration.findOne(
      {
        gallery_id: data.gallery_id,
      },
      "value"
    );

    const gallery = await AccountGallery.findOne(
      { gallery_id: data.gallery_id },
      "address"
    );

    const amount = prorationValue
      ? +data.amount - prorationValue.value
      : data.amount;

    const payload = {
      currency: "USD",
      amount,
      email: data.email,
      tx_ref: `${data.tx_ref}&${data.gallery_id}&${data.plan_id}&${
        data.plan_interval
      }&${null}`,
      country: gallery.address.countryCode,
      token: data.token,
      narration: `Payment for Omenai ${data.plan_interval} subscription`,
      redirect_url: `${dashboard_url()}/gallery/billing/plans/checkout/verification`,
      meta: {
        gallery_id: data.gallery_id,
        type: "subscription",
        plan_id: data.plan_id,
        plan_interval: data.plan_interval,
      },
    };

    const response = await fetch(
      "https://api.flutterwave.com/v3/tokenized-charges",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) return NextResponse.json(result, { status: 401 });

    await Proration.updateOne(
      { gallery_id: data.gallery_id },
      { $set: { value: 0 } }
    );

    return NextResponse.json({
      message: "Tokenized charge done",
      data: result,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
