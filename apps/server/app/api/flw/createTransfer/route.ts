import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { WithdrawalAccount } from "@omenai/shared-types";
import {
  generateAlphaDigit,
  generateDigit,
} from "@omenai/shared-utils/src/generateToken";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { getApiUrl } from "@omenai/url-config/src/config";

export async function POST(request: Request) {
  try {
    const {
      account_details,
      amount,
      currency,
      wallet_id,
      wallet_pin,
    }: {
      account_details: WithdrawalAccount;
      amount: number;
      currency: string;
      wallet_id: string;
      wallet_pin: string;
    } = await request.json();
    await connectMongoDB();

    // const payload = {
    //   account_bank: "044",
    //   account_number: "0690000040",
    //   amount: 100,
    //   currency: "NGN",
    //   // debit_subaccount: "PSA******07974",
    //   // beneficiary: 3768,
    //   beneficiary_name: "Yemi Desola",
    //   reference: `${generateAlphaDigit(12)}_PMCKDU_1`,
    //   debit_currency: "USD",
    //   // destination_branch_code: "GH280103",
    //   callback_url: `https://api.omenai.app/api/webhook/flw-transfer`,
    //   narration: "Payment for goods purchased",
    //   meta: {
    //     wallet_id,
    //     url: `https://api.omenai.app/api/webhook/flw-transfer`,
    //   },
    // };

    const payload = {
      account_bank: account_details.bank_code,
      account_number: account_details.account_number,
      amount,
      currency,
      beneficiary: account_details.beneficiary_id,
      beneficiary_name: account_details.account_name,
      reference: `OMENAI_TRANSFER_${generateAlphaDigit(12)}_PMCKDU_1`,
      debit_currency: "USD",
      destination_branch_code: account_details.bank_branch,
      callback_url: `${getApiUrl()}/api/webhook/flw-transfer`,
      narration: `Omenai wallet transfer`,
      meta: {
        wallet_id,
        url: `${getApiUrl()}/api/webhook/flw-transfer`,
      },
    };

    const get_wallet = await Wallet.findOne(
      { wallet_id },
      "available_balance wallet_pin"
    );
    if (!get_wallet)
      throw new NotFoundError("No wallet with the given ID found");

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
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
