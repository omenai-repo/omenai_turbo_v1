import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const { trans_recipient_id } = await request.json();

    const fetchTransactions = await PurchaseTransactions.find({
      trans_recipient_id,
    });

    if (!fetchTransactions)
      throw new ServerError("An error was encountered. Please try again");

    return NextResponse.json(
      {
        message: "Transaction fetched",
        data: fetchTransactions,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
