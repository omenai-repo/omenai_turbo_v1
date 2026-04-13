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
import { CombinedConfig, WalletModelSchemaTypes } from "@omenai/shared-types";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { createErrorRollbarReport, validateRequestBody } from "../../util";
import { fetchConfigCatValue } from "@omenai/shared-lib/configcat/configCatFetch";
import { z } from "zod";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};

// 1. Updated Zod Schema with the "us" union
const Schema = z.object({
  owner_id: z.string(),
  base_currency: z.string(),
  account_details: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("africa"),
      account_number: z.string(),
      bank_name: z.string(),
      account_name: z.string(),
      bank_id: z.union([z.number(), z.string()]).optional(),
      bank_code: z.string(),
      branch: z.any().nullable().optional(),
      bank_country: z.string(),
    }),
    z.object({
      type: z.literal("uk"),
      account_number: z.string(),
      sort_code: z.string(),
      bank_name: z.string().optional(),
      account_name: z.string(),
      bank_country: z.string(),
    }),
    z.object({
      type: z.literal("us"),
      account_number: z.string(),
      routing_number: z.string(),
      bank_name: z.string().optional(),
      account_name: z.string(),
      bank_country: z.string(),
    }),
    z.object({
      type: z.literal("eu"),
      iban: z.string(),
      swift_code: z.string(),
      bank_name: z.string().optional(),
      account_name: z.string(),
      bank_country: z.string(),
    }),
  ]),
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

    // 2. Fetch Existing Wallet
    const wallet_exists = (await Wallet.findOne({
      owner_id,
    })) as WalletModelSchemaTypes;

    if (!wallet_exists) {
      throw new NotFoundError(
        "Wallet doesn't exist for this user, please escalate to IT support",
      );
    }

    // 3. Updated Deduplication Logic
    const existingAccount = wallet_exists.primary_withdrawal_account;

    if (existingAccount && existingAccount.type === account_details.type) {
      const isSameAfrica =
        existingAccount.type === "africa" &&
        account_details.type === "africa" &&
        existingAccount.account_number === account_details.account_number &&
        existingAccount.bank_code === account_details.bank_code;

      const isSameUK =
        existingAccount.type === "uk" &&
        account_details.type === "uk" &&
        existingAccount.account_number === account_details.account_number &&
        existingAccount.sort_code === account_details.sort_code;

      const isSameUS =
        existingAccount.type === "us" &&
        account_details.type === "us" &&
        existingAccount.account_number === account_details.account_number &&
        existingAccount.routing_number === account_details.routing_number;

      const isSameEU =
        existingAccount.type === "eu" &&
        account_details.type === "eu" &&
        existingAccount.iban === account_details.iban &&
        existingAccount.swift_code === account_details.swift_code;

      if (isSameAfrica || isSameUK || isSameUS || isSameEU) {
        throw new BadRequestError("Primary withdrawal account already exists");
      }
    }

    let updated_account_data: any = { ...account_details };

    // 4. Conditional Flutterwave API Call (v3)
    if (account_details.type === "africa") {
      const payload = {
        account_bank: account_details.bank_code,
        account_number: account_details.account_number,
        beneficiary_name: account_details.account_name,
        currency: base_currency,
        bank_name: account_details.bank_name,
      };

      const response = await fetch(
        "https://api.flutterwave.com/v3/beneficiaries",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new ServerError(
            "Flutterwave provider is currently unreachable.",
          );
        }
        return NextResponse.json(
          { message: errorData.message },
          { status: 400 },
        );
      }

      const result = await response.json();
      updated_account_data.beneficiary_id = result.data.id;
    } else {
      // v3 International Routing (UK, EU, US): Save directly to DB, bypass API
      updated_account_data.beneficiary_id = 0;
    }

    // 5. Clean up Old African Beneficiary
    if (
      existingAccount &&
      existingAccount.type === "africa" &&
      existingAccount.beneficiary_id
    ) {
      try {
        await fetch(
          `https://api.flutterwave.com/v3/beneficiaries/${existingAccount.beneficiary_id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
          },
        );
      } catch (cleanupError) {
        console.error(
          "Failed to clean up old Flutterwave record:",
          cleanupError,
        );
      }
    }

    // 6. Update MongoDB
    const add_primary_account = await Wallet.updateOne(
      { owner_id },
      { $set: { primary_withdrawal_account: updated_account_data } },
    );

    if (add_primary_account.modifiedCount === 0) {
      throw new ServerError(
        "An error was encountered. Please try again or contact IT support",
      );
    }

    return NextResponse.json(
      { message: "Primary account added successfully" },
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
