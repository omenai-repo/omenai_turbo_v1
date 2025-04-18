import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { NextResponse } from "next/server";
import {
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import { isRepeatingOrConsecutive } from "@omenai/shared-utils/src/checkIfPinRepeating";
export async function POST(request: Request) {
  try {
    await connectMongoDB();
    const { wallet_id, pin } = await request.json();

    const isPinRepeatingOrConsecutive: boolean = isRepeatingOrConsecutive(pin);

    if (isPinRepeatingOrConsecutive)
      throw new ForbiddenError(
        "Wallet pin cannot be repeating or consecutive. Please try again"
      );

    const hashedPin = await hashPassword(pin);

    const createWalletPin = await Wallet.updateOne(
      { wallet_id },
      { $set: { wallet_pin: hashedPin } }
    );

    if (createWalletPin.modifiedCount === 0)
      throw new ServerError(
        "An error was encountered while updating your wallet pin. Please try again or contact IT support"
      );

    return NextResponse.json(
      {
        message: "Wallet pin updated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
}
