import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { ForbiddenError } from "../../../../custom/errors/dictionary/errorDictionary";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["user"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    const isFlwPaymentEnabled =
      (await fetchConfigCatValue("flutterwave_payment_enabled", "high")) ??
      false;
    if (!isFlwPaymentEnabled) {
      throw new ForbiddenError("Flutterwave payment is currently disabled");
    }
    const data = await request.json();

    const payload = {
      currency: "USD",
      customer: data.customer,
      amount: data.amount,
      email: data.customer.email,
      fullname: data.customer.name,
      tx_ref: data.tx_ref,
      redirect_url: data.redirect,
      meta: data.meta,
    };

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return NextResponse.json({
      message: "Done",
      data: result.data.link,
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
