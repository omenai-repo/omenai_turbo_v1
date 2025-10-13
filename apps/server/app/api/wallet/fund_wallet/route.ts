import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextResponse } from "next/server";
import {
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";

// TODO: Freakishly protect this route and add Idempotency if possible
export const POST = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();
      const data = await request.json();

      // Check if wallet exists
      const wallet_exists = await Wallet.findOne({ owner_id: data.owner_id });

      if (!wallet_exists)
        throw new NotFoundError(
          "Wallet doesn't exists for this user, please escalate to IT support"
        );

      const fund_wallet = await Wallet.updateOne(
        { owner_id: data.owner_id },
        { $inc: { pending_balance: data.amount } }
      );

      if (fund_wallet.modifiedCount === 0)
        throw new ServerError(
          "An error was encountered. Please try again or contact IT support"
        );

      return NextResponse.json(
        {
          message: "Wallet funded",
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
);
