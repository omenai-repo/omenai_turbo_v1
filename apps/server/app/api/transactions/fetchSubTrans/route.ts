import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const { gallery_id } = await request.json();

    const fetchTransactions = await SubscriptionTransactions.find({
      gallery_id: gallery_id,
    }).sort({ created_at: -1 });

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

    console.log(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
