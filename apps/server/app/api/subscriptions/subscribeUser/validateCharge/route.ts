import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const response = await fetch(
      "https://api.flutterwave.com/v3/validate-charge",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
        }),
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
