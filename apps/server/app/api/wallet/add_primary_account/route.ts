import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextResponse } from "next/server";
import {
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { WithdrawalAccount } from "@omenai/shared-types";

export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const {
      owner_id,
      account_details,
      base_currency,
    }: {
      owner_id: string;
      account_details: Omit<WithdrawalAccount, "beneficiary_id">;
      base_currency: string;
    } = await request.json();

    const payload = {
      account_bank: account_details.bank_code,
      account_number: Number(account_details.account_number),
      beneficiary_name: account_details.account_name,
      currency: base_currency,
      bank_name: account_details.bank_name,
    };
    console.log(payload);
    // Check if wallet exists
    const wallet_exists = await Wallet.findOne({ owner_id });

    if (!wallet_exists)
      throw new NotFoundError(
        "Wallet doesn't exists for this user, please escalate to IT support"
      );

    // Add to flw bneficiary
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(
      "https://api.flutterwave.com/v3/beneficiaries",
      options
    );

    const result = await response.json();

    if (!response.ok)
      return NextResponse.json(
        { message: result.message, data: result },
        { status: 400 }
      );

    const updated_account_data = {
      ...account_details,
      beneficiary_id: result.data.id,
    };

    const add_primary_account = await Wallet.updateOne(
      {
        owner_id,
      },
      { $set: { primary_withdrawal_account: updated_account_data } }
    );

    if (add_primary_account.modifiedCount === 0)
      throw new ServerError(
        "An error was encountered. Please try again or contact IT support"
      );

    return NextResponse.json(
      {
        message: "Primary account added successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.log(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
