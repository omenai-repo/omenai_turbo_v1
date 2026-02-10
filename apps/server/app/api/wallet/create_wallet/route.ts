import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextResponse } from "next/server";
import {
  ServerError,
  ServiceUnavailableError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import z from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};

const ZCreateWalletSchema = z.object({
  owner_id: z.string(),
  base_currency: z.string(),
});

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const isWalletWithdrawalEnabled =
      (await fetchConfigCatValue("wallet_withdrawal_enabled", "high")) ?? false;
    if (!isWalletWithdrawalEnabled) {
      throw new ServiceUnavailableError("Wallet is temporarily disabled");
    }

    const data = await validateRequestBody(request, ZCreateWalletSchema);

    const { owner_id, base_currency } = data;

    await connectMongoDB();

    const createWallet = await Wallet.create({ owner_id, base_currency });

    if (!createWallet)
      throw new ServerError(
        "An error was encountered. Please try again or contact IT support",
      );

    return NextResponse.json(
      {
        message: "Wallet created",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "wallet: create wallet",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
