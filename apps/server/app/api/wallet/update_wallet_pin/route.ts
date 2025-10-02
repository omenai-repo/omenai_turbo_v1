import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import {
  ConflictError,
  ForbiddenError,
  ServerError,
  NotFoundError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { hashPassword } from "@omenai/shared-lib/hash/hashPassword";
import { isRepeatingOrConsecutive } from "@omenai/shared-utils/src/checkIfPinRepeating";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  try {
    await connectMongoDB();
    const { wallet_id, pin } = await request.json();

    // ✅ Basic input validation
    if (!wallet_id || !pin) {
      throw new ForbiddenError("Wallet ID and pin are required");
    }

    // ✅ Check for repeating/consecutive pin
    if (isRepeatingOrConsecutive(pin)) {
      throw new ForbiddenError(
        "Wallet pin cannot be repeating or consecutive. Please try again"
      );
    }

    // ✅ Fetch wallet safely
    const wallet = await Wallet.findOne({ wallet_id }, "wallet_pin");

    if (!wallet) {
      // if wallet truly "must" exist, this reveals a data integrity issue
      throw new NotFoundError("Wallet not found for this user");
    }

    // ✅ Compare with existing pin if present
    if (wallet.wallet_pin) {
      const isPinMatch = bcrypt.compareSync(pin, wallet.wallet_pin);
      if (isPinMatch) {
        throw new ConflictError(
          "Your pin cannot be identical to your previous wallet pin"
        );
      }
    }

    // ✅ Hash new pin
    const hashedPin = await hashPassword(pin);

    // ✅ Update wallet
    const updateResult = await Wallet.updateOne(
      { wallet_id },
      { $set: { wallet_pin: hashedPin } }
    );

    if (updateResult.modifiedCount === 0) {
      throw new ServerError(
        "An error was encountered while updating your wallet pin. Please try again or contact IT support"
      );
    }

    // TODO: Send mail informing of pin change

    return NextResponse.json(
      { message: "Wallet pin updated successfully" },
      { status: 201 }
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error(error);

    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  }
});
