import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextResponse } from "next/server";
import {
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const { owner_id } = await request.json();

    // Check if wallet exists
    const fetchWallet = await Wallet.findOne(
      { owner_id },
      "available_balance pending_balance wallet_id primary_withdrawal_account, wallet_currency, base_currency"
    );

    if (!fetchWallet)
      throw new NotFoundError(
        "Wallet doesn't exists for this user, please escalate to IT support"
      );

    if (!fetchWallet)
      throw new ServerError(
        "An error was encountered. Please try again or contact IT support"
      );

    return NextResponse.json(
      {
        message: "Wallet data fetched",
        wallet: fetchWallet,
      },
      { status: 200 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
