import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ConflictError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    await connectMongoDB();
    const verify_transaction = await fetch(
      `https://api.flutterwave.com/v3/transactions/${data.transaction_id}/verify`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
        },
      }
    );

    const convert_verify_transaction_json_response =
      await verify_transaction.json();

    console.log(convert_verify_transaction_json_response);

    if (convert_verify_transaction_json_response.status !== "success") {
      return NextResponse.json(
        {
          message: convert_verify_transaction_json_response.message,

          data: convert_verify_transaction_json_response,
        },
        { status: 404 }
      );
    }

    if (convert_verify_transaction_json_response.data.status !== "successful") {
      return NextResponse.json(
        {
          message: "Transaction failed",
          data: convert_verify_transaction_json_response.data,
        },
        { status: 200 }
      );
    } else {
      // If subscription verification, save token to database
      if (
        convert_verify_transaction_json_response.data.meta !== null &&
        convert_verify_transaction_json_response.data.meta.type ===
          "subscription"
      ) {
        if (
          convert_verify_transaction_json_response.data.status ===
            "successful" &&
          convert_verify_transaction_json_response.data.tx_ref ===
            convert_verify_transaction_json_response.data.tx_ref &&
          convert_verify_transaction_json_response.data.amount ===
            convert_verify_transaction_json_response.data.amount &&
          convert_verify_transaction_json_response.data.currency ===
            convert_verify_transaction_json_response.data.currency
        ) {
          // Success! Confirm the customer's payment
          return NextResponse.json(
            {
              message: "Transaction successful",
              data: convert_verify_transaction_json_response.data,
            },
            { status: 200 }
          );
        } else {
          throw new ConflictError("Invalid transaction");
        }
      } else {
        // If payment type is not subscription, add it to transactions database
        return NextResponse.json(
          {
            message: "Transaction successful",
            data: convert_verify_transaction_json_response.data,
          },
          { status: 200 }
        );
      }
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
