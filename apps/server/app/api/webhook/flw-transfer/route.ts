import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { sendArtistFundsWithdrawalSuccessMail } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalSuccessMail";
import { sendArtistFundsWithdrawalFailed } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalFailed";
import { sendArtistFundsWithdrawalProcessingMail } from "@omenai/shared-emails/src/models/artist/sendArtistFundsWithdrawalProcessingMail";

import {
  WalletTransactionModelSchemaTypes,
  WalletTransactionStatusTypes,
} from "@omenai/shared-types";

import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { WalletTransaction } from "@omenai/shared-models/models/wallet/WalletTransactionSchema";

import {
  verifyWebhookSignature,
  verifyFlutterwaveTransaction,
} from "../resource-global";

import { createErrorRollbarReport } from "../../util";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";

/* -------------------------------------------------------------------------- */
/*                               DB CONNECTION                                */
/* -------------------------------------------------------------------------- */

const SECRET_HASH = process.env.FLW_SECRET_HASH!;
let mongoClient: any;

async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = await connectMongoDB();
  }
  return mongoClient;
}

/* -------------------------------------------------------------------------- */
/*                            SIGNATURE VALIDATION                             */
/* -------------------------------------------------------------------------- */

const signatureCache = new Map<string, boolean>();

async function isSignatureValid(signature: string, secretHash: string) {
  if (signatureCache.has(signature)) {
    return signatureCache.get(signature)!;
  }

  const isValid = await verifyWebhookSignature(signature, secretHash);
  signatureCache.set(signature, isValid);
  return isValid;
}

/* -------------------------------------------------------------------------- */
/*                         TRANSFER STATUS DISPATCHER                          */
/* -------------------------------------------------------------------------- */

async function dispatchTransferStatus(
  status: WalletTransactionStatusTypes,
  verified_transaction: any,
  session: any,
) {
  switch (status) {
    case "NEW":
      return { isOk: true };
    case "PENDING":
      return handleTransferPending(verified_transaction, session);
    case "SUCCESSFUL":
      return handleTransferSuccess(verified_transaction, session);
    case "FAILED":
      return handleTransferFailure(verified_transaction, session);
    default:
      return { isOk: true };
  }
}

/* -------------------------------------------------------------------------- */
/*                    TRANSFER STATUS RESOLUTION LOGIC                          */
/* -------------------------------------------------------------------------- */

async function checkAndHandleTransferStatus(
  verified_transaction: any,
  session: any,
) {
  const { id, status } = verified_transaction.data;

  try {
    const existing = await WalletTransaction.findOne<
      WalletTransactionModelSchemaTypes & {
        createdAt: string;
        updatedAt: string;
      }
    >({ trans_flw_ref_id: id });

    if (!existing) {
      return handleTransferCreation(verified_transaction, session);
    }

    if (existing.trans_status === status) {
      return { isOk: true };
    }

    if (existing.trans_status === "SUCCESSFUL" && status === "FAILED") {
      return { isOk: true };
    }

    return dispatchTransferStatus(status, verified_transaction, session);
  } catch (error) {
    createErrorRollbarReport(
      "Flutterwave Transfer webhook - status resolution error",
      error,
      500,
    );
    return { isOk: false };
  }
}

/* -------------------------------------------------------------------------- */
/*                         TRANSFER STATUS HANDLERS                            */
/* -------------------------------------------------------------------------- */

async function handleTransferPending(verified_transaction: any, session: any) {
  try {
    const res = await WalletTransaction.updateOne(
      { trans_flw_ref_id: verified_transaction.data.id },
      { $set: { trans_status: "PENDING" } },
    );

    if (res.modifiedCount === 0) {
      throw new Error("Failed to update wallet transaction");
    }

    return { isOk: true };
  } catch (error) {
    await session.abortTransaction();
    createErrorRollbarReport(
      "Flutterwave Transfer webhook - PENDING handler error",
      error,
      500,
    );
    return { isOk: false };
  }
}

async function handleTransferSuccess(verified_transaction: any, session: any) {
  try {
    const res = await WalletTransaction.updateOne(
      { trans_flw_ref_id: verified_transaction.data.id },
      { $set: { trans_status: "SUCCESSFUL" } },
    );

    if (res.modifiedCount === 0) {
      throw new Error("Failed to update wallet transaction");
    }

    const artist = await AccountArtist.findOne({
      wallet_id: verified_transaction.data.meta.wallet_id,
    });
    await sendArtistFundsWithdrawalSuccessMail({
      amount: formatPrice(verified_transaction.data.amount),
      email: artist.email,
      name: artist.name,
    });
    return { isOk: true };
  } catch (error) {
    createErrorRollbarReport(
      "Flutterwave Transfer webhook - SUCCESS handler error",
      error,
      500,
    );
    return { isOk: false };
  }
}

async function handleTransferFailure(verified_transaction: any, session: any) {
  try {
    await Promise.all([
      WalletTransaction.updateOne(
        { trans_flw_ref_id: verified_transaction.data.id },
        { $set: { trans_status: "FAILED" } },
      ),
      Wallet.updateOne(
        { wallet_id: verified_transaction.data.meta.wallet_id },
        { $inc: { available_balance: verified_transaction.data.amount } },
      ),
    ]);

    const artist = await AccountArtist.findOne({
      wallet_id: verified_transaction.data.meta.wallet_id,
    });
    await sendArtistFundsWithdrawalFailed({
      amount: formatPrice(verified_transaction.data.amount),
      email: artist.email,
      name: artist.name,
    });
    return { isOk: true };
  } catch (error) {
    createErrorRollbarReport(
      "Flutterwave Transfer webhook - FAILED handler error",
      error,
      500,
    );
    return { isOk: false };
  }
}

async function handleTransferCreation(verified_transaction: any, session: any) {
  const { amount, id, meta, status } = verified_transaction.data;

  try {
    const now = toUTCDate(new Date());
    const date_obj = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };

    // 1. Just create the missing transaction record.
    await WalletTransaction.updateOne(
      { wallet_id: meta.wallet_id, trans_flw_ref_id: id },
      {
        $setOnInsert: {
          wallet_id: meta.wallet_id,
          trans_amount: amount,
          trans_status: status,
          trans_date: date_obj,
          trans_flw_ref_id: id,
          reference: verified_transaction.data.reference, // Capture the ref too
        },
      },
      { upsert: true }, // Removed session to avoid complexity if not passing it consistently
    );

    // 2. If the status is ALREADY 'FAILED' (rare for a creation event, but possible),
    // we actually need to REFUND because we assumed it was deducted.
    if (status === "FAILED") {
      await Wallet.updateOne(
        { wallet_id: meta.wallet_id },
        { $inc: { available_balance: amount } }, // Refund
      );

      const artist = await AccountArtist.findOne({
        wallet_id: verified_transaction.data.meta.wallet_id,
      });

      await sendArtistFundsWithdrawalFailed({
        amount: formatPrice(verified_transaction.data.amount),
        email: artist.email,
        name: artist.name,
      });
      return { isOk: true };
    }

    // 3. Send Processing Mail (Only if not failed)
    const artist = await AccountArtist.findOne({
      wallet_id: verified_transaction.data.meta.wallet_id,
    });

    await sendArtistFundsWithdrawalProcessingMail({
      amount: formatPrice(verified_transaction.data.amount),
      email: artist.email,
      name: artist.name,
    });

    return { isOk: true };
  } catch (error) {
    createErrorRollbarReport(
      "Flutterwave Transfer webhook - CREATION handler error",
      error,
      500,
    );
    return { isOk: false };
  }
}

/* -------------------------------------------------------------------------- */
/*                                   ROUTE                                    */
/* -------------------------------------------------------------------------- */

export const POST = withRateLimit(standardRateLimit)(async function POST(
  request: Request,
): Promise<Response> {
  const signature = request.headers.get("verif-hash");

  const isValid = await isSignatureValid(signature!, SECRET_HASH);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 403 },
    );
  }

  const req = await request.json();

  if (req.event !== "transfer.completed") {
    return NextResponse.json({ status: 200 });
  }

  try {
    const verified_transaction = await verifyFlutterwaveTransaction(
      req,
      `https://api.flutterwave.com/v3/transfers/${req.data.id}`,
    );

    const client = await getMongoClient();
    const session = await client.startSession();

    const result = await checkAndHandleTransferStatus(
      verified_transaction,
      session,
    );

    return NextResponse.json(
      { status: result?.isOk ? 200 : 400 },
      { status: result?.isOk ? 200 : 400 },
    );
  } catch (error) {
    createErrorRollbarReport(
      "Flutterwave Transfer webhook processing - fatal error",
      error,
      500,
    );
    return NextResponse.json({ status: 400 });
  }
});
