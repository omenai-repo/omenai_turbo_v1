import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { getApiUrl } from "@omenai/url-config/src/config";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};
export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
): Promise<Response> {
  try {
    const isWalletWithdrawalEnabled =
      (await fetchConfigCatValue("wallet_withdrawal_enabled", "high")) ?? false;
    if (!isWalletWithdrawalEnabled) {
      throw new ForbiddenError("Wallet withdrawal is currently disabled");
    }
    const {
      amount,
      wallet_id,
      wallet_pin,
    }: {
      amount: number;
      wallet_id: string;
      wallet_pin: string;
    } = await request.json();
    await connectMongoDB();

    if (!amount || !wallet_id || !wallet_pin)
      throw new BadRequestError("Invalid body parameters");

    const get_wallet = await Wallet.findOne(
      { wallet_id },
      "available_balance wallet_pin primary_withdrawal_account base_currency"
    );
    if (!get_wallet)
      throw new NotFoundError("No wallet with the given ID found");

    const payload = {
      account_bank: get_wallet.primary_withdrawal_account.bank_code,
      account_number: get_wallet.primary_withdrawal_account.account_number,
      amount,
      currency: get_wallet.base_currency,
      beneficiary: get_wallet.primary_withdrawal_account.beneficiary_id,
      beneficiary_name: get_wallet.primary_withdrawal_account.account_name,
      // TODO: Remove PMCKDU Flag
      reference: `OMENAI_TRANSFER_${generateAlphaDigit(12)}_PMCKDU_1`,
      debit_currency: "USD",
      destination_branch_code:
        get_wallet.primary_withdrawal_account.branch?.branch_code,
      callback_url: `${getApiUrl()}/api/webhook/flw-transfer`,
      narration: `Omenai wallet transfer`,
      meta: {
        wallet_id,
        url: `${getApiUrl()}/api/webhook/flw-transfer`,
      },
    };

    const isPinMatch = bcrypt.compareSync(wallet_pin, get_wallet.wallet_pin);

    if (!isPinMatch) throw new ForbiddenError("Incorrect wallet pin");

    if (get_wallet.available_balance < amount)
      throw new ForbiddenError(
        "Insufficient wallet balance for this transaction"
      );

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(
      "https://api.flutterwave.com/v3/transfers",
      options
    );

    const result = await response.json();

    if (!response.ok)
      return NextResponse.json(
        { message: result.message, result },
        { status: 400 }
      );

    const now = new Date();

    const date_obj = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };

    if (result.status === "success") {
      const wallet_transaction_payload = {
        wallet_id,
        trans_amount: result.data.amount,
        trans_status: "PENDING",
        trans_date: date_obj,
        trans_flw_ref_id: result.data.id,
      };

      await WalletTransaction.create({ ...wallet_transaction_payload });
      await Wallet.updateOne(
        { wallet_id },
        { $inc: { available_balance: -result.data.amount } }
      );

      return NextResponse.json({
        message: "Transfer initiated successfully",
        data: result,
      });
    }

    // Always return a Response
    return NextResponse.json(
      { message: "Transfer could not be initiated", result },
      { status: 400 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.error(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
