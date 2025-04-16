import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextRequest, NextResponse } from "next/server";
import {
  NotFoundError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const owner_id = searchParams.get("id");

  try {
    await connectMongoDB();

    // Check if wallet exists
    const fetchWallet = await Wallet.findOne({ owner_id });

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
