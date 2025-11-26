import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextResponse } from "next/server";
import {
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport } from "../../util";

export const POST = withRateLimitHighlightAndCsrf(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();
      const { owner_id, amount } = await request.json();

      // Check if wallet exists
      const wallet_exists = await Wallet.findOne({ owner_id });

      if (!wallet_exists)
        throw new NotFoundError(
          "Wallet doesn't exists for this user, please escalate to IT support"
        );
      const move_funds_to_available_balance = await Wallet.updateOne(
        { owner_id, pending_balance: { $gte: amount } }, // Ensure enough pending balance
        {
          $inc: {
            pending_balance: -amount, // Deduct from pending
            available_balance: amount, // Add to available
          },
        }
      );

      if (move_funds_to_available_balance.modifiedCount === 0)
        throw new ServerError(
          "An error was encountered. Please try again or contact IT support"
        );

      return NextResponse.json(
        {
          message: "Funds credited to available balance",
        },
        { status: 200 }
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "wallet: unlock funds",
        error,
        error_response.status
      );
      return NextResponse.json(
        { message: error_response?.message },
        { status: error_response?.status }
      );
    }
  }
);
