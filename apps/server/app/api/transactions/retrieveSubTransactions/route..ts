import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { SubscriptionTransactions } from "@omenai/shared-models/models/transactions/SubscriptionTransactionSchema";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import { createErrorRollbarReport } from "../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
) {
  try {
    await connectMongoDB();
    const { gallery_id } = await request.json();

    const fetchTransactions = await SubscriptionTransactions.find({
      gallery_id: gallery_id,
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!fetchTransactions)
      throw new ServerError("An error was encountered. Please try again");

    return NextResponse.json(
      {
        message: "Transaction fetched",
        data: gallery_id,
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "transactions: retrieve sub transactions",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
