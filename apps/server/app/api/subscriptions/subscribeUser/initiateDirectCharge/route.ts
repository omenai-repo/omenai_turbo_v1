import { encryptPayload } from "@omenai/shared-lib/encryption/encrypt_payload";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const payload = {
      card_number: data.card,
      cvv: data.cvv,
      expiry_month: data.month,
      expiry_year: data.year,
      currency: "USD",
      amount: data.amount,
      email: data.customer.email,
      fullname: data.customer.name,
      tx_ref: `${data.tx_ref}&${data.customer.gallery_id}&${data.customer.plan_id}&${data.customer.plan_interval}&${data.charge_type}`,
      redirect_url: data.redirect,
    };
    console.log(payload);

    const encrypted_payload = encryptPayload(
      process.env.FLW_TEST_ENCRYPTION_KEY!,
      payload
    );

    const response = await fetch(
      "https://api.flutterwave.com/v3/charges?type=card",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ client: encrypted_payload }),
      }
    );

    const result = await response.json();

    return NextResponse.json({
      message: "Done",
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
}
