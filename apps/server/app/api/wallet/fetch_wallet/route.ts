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
import {
  createErrorRollbarReport,
  validateGetRouteParams,
  validateRequestBody,
} from "../../util";
import z from "zod";

export const ZFetchWalletSchema = z.object({
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
      const fetchWallet = await Wallet.findOne({
        owner_id,
      });

      if (!fetchWallet)
        throw new NotFoundError(
          "Wallet doesn't exists for this user, please escalate to IT support",
        );

      if (!fetchWallet)
        throw new ServerError(
          "An error was encountered. Please try again or contact IT support",
        );

      return NextResponse.json(
        {
          message: "Wallet validation fetched",
          wallet: fetchWallet,
        },
        { status: 200 },
      );
    } catch (error) {
      const error_response = handleErrorEdgeCases(error);
      createErrorRollbarReport(
        "wallet: fetch wallet",
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
