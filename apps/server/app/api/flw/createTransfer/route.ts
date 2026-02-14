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
  ServiceUnavailableError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { getApiUrl } from "@omenai/url-config/src/config";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
): Promise<Response> {
  await connectMongoDB();

  // 1. Capture payload early
  let body;
  try {
    body = await request.json();
  } catch (e) {
    throw new BadRequestError("Invalid JSON body");
  }

  const { amount, wallet_id, wallet_pin } = body;

  try {
    // 2. Feature Flag Check
    const isWalletWithdrawalEnabled =
      (await fetchConfigCatValue("wallet_withdrawal_enabled", "high")) ?? false;
    if (!isWalletWithdrawalEnabled) {
      throw new ServiceUnavailableError(
        "Wallet withdrawal is currently disabled",
      );
    }

    if (!amount || !wallet_id || !wallet_pin)
      throw new BadRequestError("Invalid body parameters");

    // 3. FETCH WALLET (Read-Only for Verification)
    const get_wallet = await Wallet.findOne(
      { wallet_id },
      "available_balance wallet_pin primary_withdrawal_account base_currency",
    );
    if (!get_wallet)
      throw new NotFoundError("No wallet with the given ID found");

    // 4. VERIFY PIN
    const isPinMatch = bcrypt.compareSync(wallet_pin, get_wallet.wallet_pin);
    if (!isPinMatch) throw new ForbiddenError("Incorrect wallet pin");

    // 5. 🛡️ ATOMIC DEDUCTION (The "Reservation" Pattern)
    // We try to deduct money FIRST. If this fails, we know they don't have funds.
    // This prevents the Race Condition.
    const reservedWallet = await Wallet.findOneAndUpdate(
      {
        wallet_id,
        available_balance: { $gte: amount },
      },
      { $inc: { available_balance: -amount } },
      { new: true },
    );

    if (!reservedWallet) {
      // If we are here, it means either wallet doesn't exist OR balance was too low
      // Check the original fetch to give a better error message
      if (get_wallet.available_balance < amount) {
        throw new ForbiddenError(
          "Insufficient wallet balance for this transaction",
        );
      }
      throw new ForbiddenError("Transaction failed. Please try again.");
    }

    // --- MONEY IS NOW DEDUCTED. WE PROCEED TO FLUTTERWAVE ---

    const transaction_ref = `OMENAI_TRANSFER_${generateAlphaDigit(12)}`;

    const payload = {
      account_bank: get_wallet.primary_withdrawal_account.bank_code,
      account_number: get_wallet.primary_withdrawal_account.account_number,
      amount,
      currency: get_wallet.base_currency,
      beneficiary: get_wallet.primary_withdrawal_account.beneficiary_id,
      beneficiary_name: get_wallet.primary_withdrawal_account.account_name,
      reference: transaction_ref,
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

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    let response;
    try {
      response = await fetch(
        "https://api.flutterwave.com/v3/transfers",
        options,
      );
    } catch (networkError) {
      // NETWORK FAILURE: We don't know if FLW got the request.
      // DANGER ZONE: If we refund, they might get double money. If we don't, they lose money.

      throw new ServerError(
        "Network error contacting payment provider. Funds refunded.",
      );
    }

    const result = await response.json();

    // 6. HANDLE FLUTTERWAVE FAILURE -> REFUND
    if (!response.ok || result.status === "error") {
      // The transfer failed on FLW side. We must give the money back.
      await Wallet.updateOne(
        { wallet_id },
        { $inc: { available_balance: amount } }, // Add the money back
      );

      return NextResponse.json(
        { message: result.message || "Transfer failed", result },
        { status: 400 },
      );
    }

    // 7. SUCCESS
    // Money is already deducted. We just log the transaction now.
    const now = new Date();
    const date_obj = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };

    // We use updateOne with upsert to log the transaction
    await WalletTransaction.updateOne(
      { wallet_id, trans_flw_ref_id: result.data.id },
      {
        $setOnInsert: {
          wallet_id,
          trans_amount: result.data.amount,
          trans_status: "PENDING", // Webhook will update this to SUCCESS/FAILED
          trans_date: date_obj,
          trans_flw_ref_id: result.data.id,
          reference: transaction_ref,
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      message: "Transfer initiated successfully",
      data: result,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "flutterwave: create transfert",
      error,
      error_response.status,
    );
    console.error(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
