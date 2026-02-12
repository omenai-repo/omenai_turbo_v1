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

/* -------------------------------------------------------------------------- */
/* DB CONNECTION                                 */
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
/* TRANSFER STATUS DISPATCHER                          */
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
/* TRANSFER STATUS RESOLUTION LOGIC                      */
/* -------------------------------------------------------------------------- */

async function checkAndHandleTransferStatus(
  verified_transaction: any,
  session: any,
) {
  const { id, status } = verified_transaction.data;

  const existing =
    await WalletTransaction.findOne<WalletTransactionModelSchemaTypes>({
      trans_flw_ref_id: id,
    });

  if (!existing) {
    return handleTransferCreation(verified_transaction, session);
  }

  // Idempotency check: If status matches, we've already processed this.
  if (existing.trans_status === status) {
    return { isOk: true };
  }

  // Logic check: Cannot fail a success (money already gone).
  if (existing.trans_status === "SUCCESSFUL" && status === "FAILED") {
    createErrorRollbarReport(
      "Critical: Flutterwave sent FAILED webhook for a SUCCESSFUL transaction",
      new Error(`Transaction ID: ${id}`),
      500,
    );
    return { isOk: true }; // Return OK to stop retry loop
  }

  return dispatchTransferStatus(status, verified_transaction, session);
}

/* -------------------------------------------------------------------------- */
/* TRANSFER STATUS HANDLERS                            */
/* -------------------------------------------------------------------------- */

async function handleTransferPending(verified_transaction: any, session: any) {
  try {
    const res = await WalletTransaction.updateOne(
      { trans_flw_ref_id: verified_transaction.data.id },
      { $set: { trans_status: "PENDING" } },
    ).session(session);

    if (res.modifiedCount === 0) {
      console.warn("Transfer PENDING update had no effect.");
    }

    return { isOk: true };
  } catch (error) {
    // Let the main catch block handle aborting
    throw error;
  }
}

async function handleTransferSuccess(verified_transaction: any, session: any) {
  const { id, meta, amount } = verified_transaction.data;

  try {
    const res = await WalletTransaction.updateOne(
      { trans_flw_ref_id: id },
      { $set: { trans_status: "SUCCESSFUL" } },
    ).session(session);

    if (res.matchedCount === 0) {
      throw new Error("Transaction not found for SUCCESS update");
    }

    const artist = await AccountArtist.findOne({ wallet_id: meta.wallet_id });
    if (artist) {
      sendArtistFundsWithdrawalSuccessMail({
        amount: formatPrice(amount),
        email: artist.email,
        name: artist.name,
      }).catch((e) => console.error("Email failed", e));
    }

    return { isOk: true };
  } catch (error) {
    throw error;
  }
}

async function handleTransferFailure(verified_transaction: any, session: any) {
  const { id, meta, amount } = verified_transaction.data;

  try {
    const transactionUpdate = await WalletTransaction.updateOne(
      {
        trans_flw_ref_id: id,
        trans_status: { $ne: "FAILED" },
      },
      { $set: { trans_status: "FAILED" } },
    ).session(session);

    // 2. REFUND WALLET (Conditional)
    if (transactionUpdate.modifiedCount > 0) {
      await Wallet.updateOne(
        { wallet_id: meta.wallet_id },
        { $inc: { available_balance: amount } },
      ).session(session);

      console.log(`Refunded ${amount} to wallet ${meta.wallet_id}`);

      // Fire-and-forget email
      const artist = await AccountArtist.findOne({ wallet_id: meta.wallet_id });
      if (artist) {
        sendArtistFundsWithdrawalFailed({
          amount: formatPrice(amount),
          email: artist.email,
          name: artist.name,
        }).catch((e) => console.error("Email failed", e));
      }
    } else {
      console.log("Transaction already failed or not found. Skipping refund.");
    }

    return { isOk: true };
  } catch (error) {
    throw error;
  }
}

async function handleTransferCreation(verified_transaction: any, session: any) {
  const { amount, id, meta, status, reference } = verified_transaction.data;

  try {
    const now = toUTCDate(new Date());
    const date_obj = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };

    // 1. Upsert Transaction
    // Use upsert to handle race conditions where creation event comes same time as pending
    await WalletTransaction.updateOne(
      { wallet_id: meta.wallet_id, trans_flw_ref_id: id },
      {
        $setOnInsert: {
          wallet_id: meta.wallet_id,
          trans_amount: amount,
          trans_status: status,
          trans_date: date_obj,
          trans_flw_ref_id: id,
          reference: reference,
        },
      },
      { upsert: true },
    ).session(session);

    // 2. Handle Immediate Failure Refund
    // If created as FAILED (rare), ensure we refund if we assumed deduction happened.
    if (status === "FAILED") {
      await Wallet.updateOne(
        { wallet_id: meta.wallet_id },
        { $inc: { available_balance: amount } },
      ).session(session);

      const artist = await AccountArtist.findOne({ wallet_id: meta.wallet_id });
      if (artist) {
        sendArtistFundsWithdrawalFailed({
          amount: formatPrice(amount),
          email: artist.email,
          name: artist.name,
        }).catch(console.error);
      }
      return { isOk: true };
    }

    // 3. Send Processing Mail
    const artist = await AccountArtist.findOne({ wallet_id: meta.wallet_id });
    if (artist) {
      sendArtistFundsWithdrawalProcessingMail({
        amount: formatPrice(amount),
        email: artist.email,
        name: artist.name,
      }).catch(console.error);
    }

    return { isOk: true };
  } catch (error) {
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* ROUTE                                    */
/* -------------------------------------------------------------------------- */

// NOTE: Rate limiter removed. Webhooks should not be IP rate limited.
export const POST = async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("verif-hash");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 403 });
  }

  // Verify signature - No caching, direct check
  const isValid = await verifyWebhookSignature(signature, SECRET_HASH);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 403 },
    );
  }

  try {
    const req = await request.json();

    // Early exit for non-transfer events
    if (req.event !== "transfer.completed") {
      return NextResponse.json({ status: 200 });
    }

    // Verify transaction exists on Flutterwave
    const verified_transaction = await verifyFlutterwaveTransaction(
      req,
      `https://api.flutterwave.com/v3/transfers/${req.data.id}`,
    );

    const client = await getMongoClient();
    const session = await client.startSession();

    let result;
    try {
      session.startTransaction();

      // Pass session down to all logic
      result = await checkAndHandleTransferStatus(
        verified_transaction,
        session,
      );

      await session.commitTransaction();
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

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

    return NextResponse.json({ status: 200 });
  }
};
