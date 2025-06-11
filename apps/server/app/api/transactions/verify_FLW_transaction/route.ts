import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ConflictError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    const data = await request.json();

    // Ensure the secret key is defined
    const secretKey = process.env.FLW_TEST_SECRET_KEY;
    if (!secretKey) {
      throw new Error(
        "Flutterwave secret key is not defined in environment variables."
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Verify the transaction with Flutterwave
    const flutterwaveResponse = await fetch(
      `https://api.flutterwave.com/v3/transactions/${data.transaction_id}/verify`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const transactionData = await flutterwaveResponse.json();

    // Log the response (replace with a proper logging mechanism in production)
    console.log(transactionData);

    // Handle unsuccessful verification
    if (transactionData.status !== "success") {
      return createResponse(transactionData.message, transactionData, 404);
    }

    // Handle failed transactions
    if (transactionData.data.status !== "successful") {
      return createResponse("Transaction failed", transactionData.data, 200);
    }

    // Handle subscription transactions
    if (transactionData.data.meta?.type === "subscription") {
      const isValidSubscription = validateSubscription(transactionData.data);
      if (!isValidSubscription) {
        throw new ConflictError("Invalid transaction");
      }

      return createResponse(
        "Transaction successful",
        transactionData.data,
        200
      );
    }

    // Handle non-subscription transactions
    return createResponse("Transaction successful", transactionData.data, 200);
  } catch (error) {
    const errorResponse = handleErrorEdgeCases(error);

    // Log the error (replace with a proper logging mechanism in production)
    console.error(error);

    return NextResponse.json(
      { message: errorResponse?.message },
      { status: errorResponse?.status }
    );
  }
});
// Utility function to create a standardized response
function createResponse(message: string, data: any, status: number) {
  return NextResponse.json(
    {
      message,
      data,
    },
    { status }
  );
}

// Utility function to validate subscription transactions
function validateSubscription(transaction: any): boolean {
  return (
    transaction.status === "successful" &&
    transaction.tx_ref === transaction.tx_ref &&
    transaction.amount === transaction.amount &&
    transaction.currency === transaction.currency
  );
}
