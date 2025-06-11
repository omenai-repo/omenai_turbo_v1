import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextRequest, NextResponse } from "next/server";
import {
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";

export const GET = withRateLimitAndHighlight(standardRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const owner_id = searchParams.get("id");

    try {
      await connectMongoDB();

      // Check if wallet exists
      const fetchWallet = await Wallet.findOne({ owner_id });

      if (!fetchWallet)
        throw new NotFoundError(
          "Wallet doesn't exists for this user, please escalate to IT support"
        );

      if (!fetchWallet)
        throw new ServerError(
          "An error was encountered. Please try again or contact IT support"
        );

      return NextResponse.json(
        {
          message: "Wallet data fetched",
          wallet: fetchWallet,
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
