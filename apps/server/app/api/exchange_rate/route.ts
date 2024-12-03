import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    const { currency, amount } = await request.json();

    const data = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env
        .EXCHANGE_RATE_API_KEY!}/pair/${currency}/USD/${amount}`,
      { method: "GET" }
    );

    const result = await data.json();

    return NextResponse.json({ data: result.conversion_result });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
