import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import {
  BadRequestError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";

export async function POST(request: Request) {
  try {
    const { bankCode } = await request.json();

    if (!bankCode)
      throw new BadRequestError("Invalid parameters - Bank code missing");

    const response = await fetch(
      `https://api.flutterwave.com/v3/banks/${bankCode}/branches`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
        },
      }
    );
    const result = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { message: result.message },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        message: "Bank branches fetched successfully",
        no_of_bank_branches: result.data.length,
        bank_branches: result.data,
      },
      { status: response.status }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
