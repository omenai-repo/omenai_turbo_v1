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

  let body;
  try {
    body = await request.json();
  } catch (e) {
    throw new BadRequestError("Invalid JSON body");
  }

  const { amount, wallet_id, wallet_pin } = body;

  try {
    const isWalletWithdrawalEnabled =
      (await fetchConfigCatValue("wallet_withdrawal_enabled", "high")) ?? false;
    if (!isWalletWithdrawalEnabled) {
      throw new ServiceUnavailableError(
        "Wallet withdrawal is currently disabled",
      );
    }

    if (!amount || !wallet_id || !wallet_pin)
      throw new BadRequestError("Invalid body parameters");

    const get_wallet = await Wallet.findOne(
      { wallet_id },
      "available_balance wallet_pin primary_withdrawal_account base_currency",
    );
    if (!get_wallet)
      throw new NotFoundError("No wallet with the given ID found");

    const isPinMatch = bcrypt.compareSync(wallet_pin, get_wallet.wallet_pin);
    if (!isPinMatch) throw new ForbiddenError("Incorrect wallet pin");

    // 1. Atomic Deduction from Omenai DB (in USD)
    const reservedWallet = await Wallet.findOneAndUpdate(
      {
        wallet_id,
        available_balance: { $gte: amount },
      },
      { $inc: { available_balance: -amount } },
      { new: true },
    );

    if (!reservedWallet) {
      if (get_wallet.available_balance < amount) {
        throw new ForbiddenError(
          "Insufficient wallet balance for this transaction",
        );
      }
      throw new ForbiddenError("Transaction failed. Please try again.");
    }

    const transaction_ref = `OMENAI_TRANSFER_${generateAlphaDigit(12)}`;
    const primaryAccount = get_wallet.primary_withdrawal_account;

    // 2. STRICT CURRENCY ROUTING
    let DESTINATION_CURRENCY = "USD";
    let SOURCE_CURRENCY = get_wallet.base_currency;

    if (primaryAccount.type === "uk") SOURCE_CURRENCY = "GBP";
    if (primaryAccount.type === "eu") SOURCE_CURRENCY = "EUR";
    if (primaryAccount.type === "us") SOURCE_CURRENCY = "USD";

    // 3. DYNAMIC FX CONVERSION (USD -> LOCAL)
    let final_transfer_amount = amount;

    if (DESTINATION_CURRENCY !== SOURCE_CURRENCY) {
      try {
        // We ask FLW: "I have {amount} USD. How much {DESTINATION_CURRENCY} will that buy?"
        const rateResponse = await fetch(
          `https://api.flutterwave.com/v3/transfers/rates?amount=${amount}&destination_currency=${DESTINATION_CURRENCY}&source_currency=${SOURCE_CURRENCY}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        const rateData = await rateResponse.json();
        console.log(rateData);

        if (!rateResponse.ok || rateData.status === "error") {
          // Rollback deduction if FX lookup fails
          await Wallet.updateOne(
            { wallet_id },
            { $inc: { available_balance: amount } },
          );
          throw new ServerError(
            "Exchange rate provider unavailable. Please try again.",
          );
        }

        // FLW returns the exact local currency equivalent
        final_transfer_amount = rateData.data.source.amount;
      } catch (err) {
        await Wallet.updateOne(
          { wallet_id },
          { $inc: { available_balance: amount } },
        );
        throw new ServerError(
          "Network error fetching exchange rate. Funds refunded.",
        );
      }
    }

    // 4. BUILD THE TRANSFER PAYLOAD
    let payload: Record<string, any> = {
      amount: final_transfer_amount,
      debit_currency: DESTINATION_CURRENCY,
      currency: SOURCE_CURRENCY,
      reference: transaction_ref,
      callback_url: `${getApiUrl()}/api/webhook/flw-transfer`,
      narration: `Omenai wallet transfer`,
    };

    // Append routing details based on region type
    if (primaryAccount.type === "africa") {
      payload.beneficiary = primaryAccount.beneficiary_id;
      payload.beneficiary_name = primaryAccount.account_name;
      payload.account_bank = primaryAccount.bank_code;
      payload.account_number = primaryAccount.account_number;
      payload.meta = {
        wallet_id,
        url: `${getApiUrl()}/api/webhook/flw-transfer`,
      };

      if (primaryAccount.branch?.branch_code) {
        payload.destination_branch_code = primaryAccount.branch.branch_code;
      }
    } else if (primaryAccount.type === "uk") {
      payload.beneficiary_name = primaryAccount.account_name;
      payload.meta = [
        {
          account_number: primaryAccount.account_number,
          routing_number: primaryAccount.sort_code,
          bank_name: primaryAccount.bank_name || "UK Bank",
          beneficiary_name: primaryAccount.account_name,
          beneficiary_country: primaryAccount.bank_country || "GB",
          wallet_id: wallet_id,
          url: `${getApiUrl()}/api/webhook/flw-transfer`,
        },
      ];
    } else if (primaryAccount.type === "us") {
      payload.beneficiary_name = primaryAccount.account_name;
      payload.meta = [
        {
          account_number: primaryAccount.account_number,
          routing_number: primaryAccount.routing_number,
          bank_name: primaryAccount.bank_name || "US Bank",
          beneficiary_name: primaryAccount.account_name,
          beneficiary_country: "US",
          wallet_id: wallet_id,
          url: `${getApiUrl()}/api/webhook/flw-transfer`,
        },
      ];
    } else if (primaryAccount.type === "eu") {
      payload.beneficiary_name = primaryAccount.account_name;
      payload.meta = [
        {
          account_number: primaryAccount.iban,
          routing_number: primaryAccount.swift_code,
          swift_code: primaryAccount.swift_code,
          bank_name: primaryAccount.bank_name || "EU Bank",
          beneficiary_name: primaryAccount.account_name,
          beneficiary_country: primaryAccount.bank_country,
          wallet_id: wallet_id,
          url: `${getApiUrl()}/api/webhook/flw-transfer`,
        },
      ];
    }

    // 5. FIRE TRANSFER API
    let response;
    try {
      response = await fetch("https://api.flutterwave.com/v3/transfers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      await Wallet.updateOne(
        { wallet_id },
        { $inc: { available_balance: amount } },
      );
      throw new ServerError(
        "Network error contacting payment provider. Funds refunded.",
      );
    }

    const result = await response.json();

    // 6. HANDLE API REJECTIONS -> REFUND
    if (!response.ok || result.status === "error") {
      await Wallet.updateOne(
        { wallet_id },
        { $inc: { available_balance: amount } },
      );
      return NextResponse.json(
        { message: result.message || "Transfer failed", result },
        { status: 400 },
      );
    }

    // 7. SUCCESS LOGGING
    const now = new Date();
    const date_obj = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };

    await WalletTransaction.updateOne(
      { wallet_id, trans_flw_ref_id: result.data.id },
      {
        $setOnInsert: {
          wallet_id,
          trans_amount: amount, // Logs the GBP/EUR amount FLW processed
          trans_status: "PENDING",
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
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
