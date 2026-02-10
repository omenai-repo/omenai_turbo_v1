import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextRequest, NextResponse } from "next/server";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateGetRouteParams } from "../../util";
import z from "../../../../node_modules/zod/v4/classic/external.cjs";

const ZFetchWalletSchema = z.object({
  owner_id: z.string().min(1),
});

export const GET = withRateLimitHighlightAndCsrf(standardRateLimit)(
  async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const owner_id = searchParams.get("id");

    const rawParam = {
      owner_id,
    };
    try {
      const data = validateGetRouteParams(ZFetchWalletSchema, rawParam);

      const { owner_id } = data;

      await connectMongoDB();

      // Check if wallet exists
      const fetch_wallet = await Wallet.findOne(
        { owner_id },
        "available_balance pending_balance wallet_id",
      );

      if (!fetch_wallet)
        throw new NotFoundError(
          "Wallet doesn't exists for this user, please escalate to IT support",
        );

      const balances = {
        available: fetch_wallet.available_balance,
        pending: fetch_wallet.pending_balance,
        wallet_id: fetch_wallet.wallet_id,
      };

      return NextResponse.json(
        {
          message: "Wallet balance fetched",
          balances,
        },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "wallet: fetch wallet balance",
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
