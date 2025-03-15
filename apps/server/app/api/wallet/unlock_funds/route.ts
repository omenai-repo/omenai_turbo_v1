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
    const move_funds_to_available_balance = await Wallet.updateOne(
      { owner_id: data.owner_id, pending_balance: { $gte: data.amount } }, // Ensure enough pending balance
      {
        $inc: {
          pending_balance: -data.amount, // Deduct from pending
          available_balance: data.amount, // Add to available
        },
      },
      { new: true } // Return updated document
    );

    if (!move_funds_to_available_balance)
      throw new ServerError(
        "An error was encountered. Please try again or contact IT support"
      );

    return NextResponse.json(
      {
        message: "Funds credited to available balance",
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
