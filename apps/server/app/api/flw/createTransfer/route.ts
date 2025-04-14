import { string } from "zod";
import { encryptPayload } from "@omenai/shared-lib/encryption/encrypt_payload";
import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { WithdrawalAccount } from "@omenai/shared-types";
import { generateAlphaDigit } from "@omenai/shared-utils/src/generateToken";

export async function POST(request: Request) {
  try {
    // const {
    //   account_details,
    //   amount,
    //   currency,
    //   url,
    // }: {
    //   account_details: WithdrawalAccount;
    //   amount: number;
    //   currency: string;
    //   url: string;
    // } = await request.json();

    const payload = {
      account_bank: "044",
      account_number: "0690000040",
      amount: 100,
      currency: "NGN",
      // debit_subaccount: "PSA******07974",
      // beneficiary: 3768,
      // beneficiary_name: "Yemi Desola",
      reference: "newFLWXTrans",
      debit_currency: "USD",
      destination_branch_code: "GH280103",
      callback_url: "https://webhook.site/fc3775eb-e301-4b1e-aaf5-0ad54ee0aa85",
      narration: "Payment for goods purchased",
    };

    // const payload = {
    //   account_bank: account_details.bank_code,
    //   account_number: account_details.account_number,
    //   amount,
    //   currency,
    //   beneficiary: account_details.beneficiary_id,
    //   beneficiary_name: account_details.account_name,
    //   reference: `OMENAI_TRANSFER_${generateAlphaDigit(12)}`,
    //   debit_currency: "USD",
    //   destination_branch_code: account_details.bank_branch,
    //   callback_url: url,
    //   narration: `Omenai wallet transfer`,
    // };

    console.log(payload);

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
      return NextResponse.json({ message: result.message }, { status: 400 });
    console.log(result);

    return NextResponse.json({
      message: "Done",
      data: result,
    });
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    console.log(error);
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
