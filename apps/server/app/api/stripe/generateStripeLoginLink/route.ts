import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    const { account } = await request.json();

    const accountLink = await stripe.accounts.createLoginLink(account);

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.log(error);
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
