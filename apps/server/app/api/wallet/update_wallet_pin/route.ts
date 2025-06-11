import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  ConflictError,
  ForbiddenError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import { isRepeatingOrConsecutive } from "@omenai/shared-utils/src/checkIfPinRepeating";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitAndHighlight } from "@omenai/shared-lib/auth/middleware/combined_middleware";
export const POST = withRateLimitAndHighlight(strictRateLimit)(
  async function POST(request: Request) {
    try {
      await connectMongoDB();
      const { wallet_id, pin } = await request.json();
      console.log(wallet_id, pin);

      const isPinRepeatingOrConsecutive: boolean =
        isRepeatingOrConsecutive(pin);

      if (isPinRepeatingOrConsecutive)
        throw new ForbiddenError(
          "Wallet pin cannot be repeating or consecutive. Please try again"
        );

      const wallet = await Wallet.findOne({ wallet_id }, "wallet_pin");
      let isPinMatch;

      if (wallet.wallet_pin !== null) {
        isPinMatch = bcrypt.compareSync(pin, wallet.wallet_pin);

        if (isPinMatch)
          throw new ConflictError(
            "Your pin cannot be identical to your previous wallet pin"
          );
      }

      const hashedPin = await hashPassword(pin);

      const createWalletPin = await Wallet.updateOne(
        { wallet_id },
        { $set: { wallet_pin: hashedPin } }
      );

      if (createWalletPin.modifiedCount === 0)
        throw new ServerError(
          "An error was encountered while updating your wallet pin. Please try again or contact IT support"
        );

      // TODO: Send mail informing of pin change

      return NextResponse.json(
        {
          message: "Wallet pin updated successfully",
        },
        { status: 201 }
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
);
