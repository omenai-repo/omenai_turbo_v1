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
    const data = await request.json();

    // Check if wallet exists
    const wallet_exists = await Wallet.findOne({ owner_id: data.owner_id });

    if (!wallet_exists)
      throw new NotFoundError(
        "Wallet doesn't exists for this user, please escalate to IT support"
      );
    const fetchWallet = await Wallet.findOne(
      { owner_id: data.owner_id },
      "available_balance pending_balance"
    );

    if (!fetchWallet)
      throw new ServerError(
        "An error was encountered. Please try again or contact IT support"
      );

    const balances = {
      available: fetchWallet.available_balance,
      pending: fetchWallet.pending_balance,
    };

    return NextResponse.json(
      {
        message: "Wallet balance fetched",
        balances,
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
