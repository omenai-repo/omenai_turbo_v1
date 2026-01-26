import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { PurchaseTransactionModelSchemaTypes } from "@omenai/shared-types";
import { NextResponse } from "next/server";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../util";

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();
      const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_reference"> =
        await request.json();

      const createTransaction = await PurchaseTransactions.create(data);

      if (!createTransaction)
        throw new ServerError("An error was encountered. Please try again");

      return NextResponse.json(
        {
          message: "Transaction created",
        },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "transactions: create transaction",
        error,
        error_response.status,
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status },
      );
    }
  },
);
