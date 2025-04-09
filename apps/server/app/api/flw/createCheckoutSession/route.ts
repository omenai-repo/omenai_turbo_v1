import { string } from "zod";
import { encryptPayload } from "@omenai/shared-lib/encryption/encrypt_payload";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
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
    console.log(payload);

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(result);

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
}
