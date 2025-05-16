import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";

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

const SECRET_HASH = process.env.FLW_SECRET_HASH!;

let mongoClient: any;

async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = await connectMongoDB();
  }
  return mongoClient;
}

const signatureCache = new Map();

async function isSignatureValid(signature: string, secretHash: string) {
  if (signatureCache.has(signature)) {
    return signatureCache.get(signature);
  }
  const isValid = await verifyWebhookSignature(signature, secretHash);
  signatureCache.set(signature, isValid);
  return isValid;
}

async function handleStatusUtility(
  status: WalletTransactionStatusTypes,
  verified_transaction: any,
  session: any
) {
  if (status === "NEW") return { isOk: true };
  if (status === "PENDING")
    return await handleTransferPending(verified_transaction, session);
  if (status === "SUCCESSFUL")
    return await handleTransferSuccess(verified_transaction, session);
  if (status === "FAILED")
    return await handleTransferFailure(verified_transaction, session);
}
async function checkAndHandleTransferStatus(
  verified_transaction: any,
  session: any
) {
  const { id, status } = verified_transaction.data;

  try {
    // Check DB
    const fetchTransactionInDB = await WalletTransaction.findOne<
      WalletTransactionModelSchemaTypes & {
        createdAt: string;
        updatedAt: string;
      }
    >({
      trans_flw_ref_id: id,
    });

    if (!fetchTransactionInDB) {
      return await handleTransferCreation(verified_transaction, session);
    } else {
      // Check status against webhook status

      const transferStatusInDB = fetchTransactionInDB.trans_status;

      if (transferStatusInDB === status) {
        console.log(
          `Duplicate webhook received for status ${status} — skipping`
        );
        return { isOk: true };
      }

      if (transferStatusInDB === "SUCCESSFUL" && status === "FAILED") {
        // TODO: Log suspicious activity
        return { isOk: true };
      } else {
        return await handleStatusUtility(status, verified_transaction, session);
      }
    }
  } catch (error) {
    return { isOk: false };
  }
}

async function handleTransferPending(verified_transaction: any, session: any) {
  try {
    session.startTransaction();
    // Update DB
    const update_wallet_transaction_status = await WalletTransaction.updateOne(
      {
        trans_flw_ref_id: verified_transaction.data.id,
      },
      { $set: { trans_status: "PENDING" } }
    );
    if (update_wallet_transaction_status.modifiedCount === 0)
      throw new Error("Could not update wallet transaction collection");

    session.commitTransaction();
    return { isOk: true };
  } catch (error) {
    session.abortTransaction();

    console.log(error);
    return { isOk: false };
  } finally {
    session.endSession();
  }
}
async function handleTransferSuccess(verified_transaction: any, session: any) {
  try {
    session.startTransaction();
    // Update DB
    const update_wallet_transaction_status = await WalletTransaction.updateOne(
      {
        trans_flw_ref_id: verified_transaction.data.id,
      },
      { $set: { trans_status: "SUCCESSFUL" } }
    );

    if (update_wallet_transaction_status.modifiedCount === 0)
      throw new Error("Could not update wallet transaction collection");
    session.commitTransaction();
    // Send mail - Defer it it job queue
    return { isOk: true };
  } catch (error) {
    session.abortTransaction();
    console.log(error);
    return { isOk: false };
  } finally {
    session.endSession();
  }
}
async function handleTransferFailure(verified_transaction: any, session: any) {
  try {
    session.startTransaction();

    await Promise.all([
      WalletTransaction.updateOne(
        { trans_flw_ref_id: verified_transaction.data.id },
        { $set: { trans_status: "FAILED" } }
      ),
      Wallet.updateOne(
        { wallet_id: verified_transaction.data.meta.wallet_id },
        { $inc: { available_balance: verified_transaction.data.amount } }
      ),
    ]);

    await session.commitTransaction();
    // TODO: Send a mail, defer to job queue
    return { isOk: true };
  } catch (error) {
    await session.abortTransaction();
    return { isOk: false };
  } finally {
    session.endSession();
  }
}

async function handleTransferCreation(verified_transaction: any, session: any) {
  const { amount, id, meta, status } = verified_transaction.data;
  try {
    session.startTransaction();

    const now = toUTCDate(new Date());
    const date_obj = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
    const wallet_transaction_payload = {
      wallet_id: meta.wallet_id,
      trans_amount: amount,
      trans_status: status,
      trans_date: date_obj,
      trans_flw_ref_id: id,
    };
    await Promise.all([
      WalletTransaction.create({ ...wallet_transaction_payload }),
      Wallet.updateOne(
        { wallet_id: meta.wallet_id },
        { $inc: { available_balance: -amount } }
      ),
    ]);

    await session.commitTransaction();
    // TODO: Send a mail, defer to job queue
    return { isOk: true };
  } catch (error) {
    await session.abortTransaction();
    return { isOk: false };
  } finally {
    session.endSession();
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("verif-hash");
  const isValid = await isSignatureValid(signature!, SECRET_HASH);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 403 }
    );
  }

  const req = await request.json();

  if (req.event === "transfer.completed") {
    // Verify transaction with flw api
    try {
      const verified_transaction = await verifyFlutterwaveTransaction(
        req,
        `https://api.flutterwave.com/v3/transfers/${req.data.id}`
      );

      console.log(verified_transaction);
      const client = await getMongoClient();

      const session = await client.startSession();
      const result: { isOk: boolean } | undefined =
        await checkAndHandleTransferStatus(verified_transaction, session);

      if (result && result.isOk) return NextResponse.json({ status: 200 });
      else return NextResponse.json({ status: 400 });
    } catch (error) {
      return NextResponse.json({ status: 400 });
    }
  }
}
