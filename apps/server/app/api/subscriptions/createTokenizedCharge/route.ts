import { Proration } from "@omenai/shared-models/models/prorations/ProrationSchemaModel";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { CombinedConfig } from "@omenai/shared-types";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["gallery"],
};

export const POST = withRateLimit(config)(async function POST(
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

    // TODO: Fix this payload data

    const payload = {
      currency: "USD",
      amount: 97,
      email: "ravesb_504e8a8a5125f3c2e894_gbenro@omenai.net",
      tx_ref:
        "Eijt51L&d0a5bff5-cca6-4e82-873d-f9865b6aacb5&68ac34f7e4a67e144fbbd3f6&monthly&null",
      country: "US",
      token: "flw-t1nf-2af327ab273a2add108a325b9ebfb7d1-m03k",
      narration: "Payment for Omenai monthly subscription",
      redirect_url: `https://staging.dashboard.omenai.app/gallery/billing/plans/checkout/verification`,
      meta: {
        gallery_id: "d0a5bff5-cca6-4e82-873d-f9865b6aacb5",
        type: "subscription",
        plan_id: "68ac34f7e4a67e144fbbd3f6",
        plan_interval: "monthly",
        email: "ravesb_504e8a8a5125f3c2e894_gbenro@omenai.net",
      },
      preauthorize: false,
    };

    console.log(payload);

    const response = await fetch(
      "https://api.flutterwave.com/v3/tokenized-charges",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log(
      "Payload being sent to Flutterwave:",
      JSON.stringify(payload, null, 2)
    );

    const result = await response.json();

    console.log(result);

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
