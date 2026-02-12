import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  NotFoundError,
  ServerError,
  ServiceUnavailableError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { CombinedConfig } from "@omenai/shared-types";
import {
  CombinedConfig,
  WalletModelSchemaTypes,
  WithdrawalAccount,
} from "@omenai/shared-types";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import z from "zod";
import { HTTP_METHOD } from "next/dist/server/web/http";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};
const Schema = z.object({
  owner_id: z.string(),
  base_currency: z.string(),
  account_details: z.object({
    account_number: z.string(),
    bank_name: z.string(),
    account_name: z.string(),
    bank_id: z.string(),
    bank_code: z.string(),
    branch: z
      .object({
        id: z.string(),
        branch_code: z.string(),
        branch_name: z.string(),
        swift_code: z.string(),
        bic: z.string(),
        bank_id: z.string(),
      })
      .nullable(),
    bank_country: z.string(),
  }),
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
    await connectMongoDB();
    const { owner_id, account_details, base_currency } =
      await validateRequestBody(request, Schema);

    const payload = {
      account_bank: account_details.bank_code,
      account_number: account_details.account_number,
      beneficiary_name: account_details.account_name,
      currency: base_currency,
      bank_name: account_details.bank_name,
    };
    // Check if wallet exists
    const wallet_exists = (await Wallet.findOne({
      owner_id,
    })) as WalletModelSchemaTypes;

    if (!wallet_exists)
      throw new NotFoundError(
        "Wallet doesn't exists for this user, please escalate to IT support",
      );

    const appendOptions = (method: HTTP_METHOD) => {
      return {
        method: method.toUpperCase(),
        headers: {
          Authorization: `Bearer ${process.env.FLW_TEST_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      };
    };

    const accountNumber =
      wallet_exists.primary_withdrawal_account?.account_number;
    const accountName = wallet_exists.primary_withdrawal_account?.account_name;
    const bank = wallet_exists.primary_withdrawal_account?.bank_code;

    if (
      accountNumber === payload.account_number &&
      accountName === payload.beneficiary_name &&
      bank === payload.account_bank
    ) {
      throw new BadRequestError("Primary withdrawal account already exists");
    }

    const beneficiary_id =
      wallet_exists.primary_withdrawal_account?.beneficiary_id;

    if (beneficiary_id) {
      console.log(beneficiary_id);
      const response = await fetch(
        `https://api.flutterwave.com/v3/beneficiaries/${beneficiary_id}`,
        { ...appendOptions("DELETE") },
      );

      const result = await response.json();

      console.log(result);

      if (
        result.status !== "success" &&
        result.message !== "Beneficiary not found"
      )
        throw new ServerError(
          "Something went wrong will adding your account, please try again later or contact support",
        );
    }

    const response = await fetch(
      "https://api.flutterwave.com/v3/beneficiaries",
      options,
      { ...appendOptions("POST"), body: JSON.stringify(payload) },
    );

    const result = await response.json();

    if (!response.ok)
      return NextResponse.json(
        { message: result.message, data: result },
        { status: 400 },
      );

    const updated_account_data = {
      ...account_details,
      beneficiary_id: result.data.id,
    };

    const add_primary_account = await Wallet.updateOne(
      {
        owner_id,
      },
      { $set: { primary_withdrawal_account: updated_account_data } },
    );

    // TODO: Create a retry mechanism for this as this is destructive behavior
    if (add_primary_account.modifiedCount === 0)
      throw new ServerError(
        "An error was encountered. Please try again or contact IT support",
      );

    return NextResponse.json(
      {
        message: "Primary account added successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "wallet: add primary account",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
