import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextRequest, NextResponse } from "next/server";
import { NotFoundError } from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    const searchParams = request.nextUrl.searchParams;
    const owner_id = searchParams.get("id");

    // Check if wallet exists
    const fetch_wallet = await Wallet.findOne(
      { owner_id },
      "available_balance pending_balance wallet_id"
    );

    if (!fetch_wallet)
      throw new NotFoundError(
        "Wallet doesn't exists for this user, please escalate to IT support"
      );

    const balances = {
      available: fetch_wallet.available_balance,
      pending: fetch_wallet.pending_balance,
      wallet_id: fetch_wallet.wallet_id,
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
