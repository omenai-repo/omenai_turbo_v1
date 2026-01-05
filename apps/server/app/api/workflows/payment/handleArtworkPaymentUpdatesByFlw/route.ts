import { serve } from "@upstash/workflow/nextjs";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import {
  ExclusivityUpholdStatus,
  PaymentLedgerPayloadTypes,
  PaymentLedgerTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
} from "@omenai/shared-types";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { redis } from "@omenai/upstash-config";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { MetaSchema } from "@omenai/shared-types";

// Map the payload of the expected data here
type Payload = {
  provider: PaymentLedgerTypes["provider"];
  meta: MetaSchema;
  verified_transaction: any;
};

type FulfillmentStepResult = {
  step: keyof PaymentLedgerTypes["payment_fulfillment"];
  status: "done" | "failed";
  reason?: string;
};

export const { POST } = serve<Payload>(async (ctx) => {
  // Retrieve the payload here for use within your runs
  const { provider, meta, verified_transaction }: Payload = ctx.requestPayload;
  const amount = verified_transaction.amount;
  const transaction_id = verified_transaction.id;

  const transaction_status = verified_transaction.status;

  // Implement your workflow logic within ctx.run
  const update_run = await ctx.run(
    "handle_artwork_payment_update_flw",
    async () => {
      await connectMongoDB();

      const is_fulfillment_checked = (await PaymentLedger.findOne(
        {
          provider_tx_id: transaction_id,
          provider: "flutterwave",
        },
        "payment_fulfillment_checks_done"
      ).lean()) as { payment_fulfillment_checks_done: boolean } | null;

      if (is_fulfillment_checked?.payment_fulfillment_checks_done) {
        return true;
      }

      const artist = (await AccountArtist.findOne(
        { artist_id: meta.seller_id },
        "exclusivity_uphold_status"
      ).lean()) as {
        exclusivity_uphold_status: ExclusivityUpholdStatus;
      } | null;

      if (!artist) {
        rollbarServerInstance.error({
          context: "Artist not found during payment fulfillment",
          seller_id: meta.seller_id,
        });

        return true;
      }
      const exclusivity_uphold_status: ExclusivityUpholdStatus =
        artist.exclusivity_uphold_status;
      const response: boolean = await handlePaymentTransactionUpdates(
        amount,
        transaction_id,
        exclusivity_uphold_status,
        meta,
        transaction_status,
        provider,
        verified_transaction
      );

      return response;
    }
  );
  return Boolean(update_run);
});

export function buildPricing(
  meta: MetaSchema,
  exclusivity_uphold_status: ExclusivityUpholdStatus
) {
  const { isBreached, incident_count } = exclusivity_uphold_status;

  const penalty_rate = (10 * Math.min(incident_count, 6)) / 100;
  const penalty_fee = isBreached
    ? penalty_rate * Number(meta.unit_price ?? 0)
    : 0;

  const commission = Math.round(0.35 * Number(meta.unit_price ?? 0));

  return { penalty_fee, commission };
}

async function handlePaymentTransactionUpdates(
  amount: number,
  transaction_id: string,
  exclusivity_uphold_status: ExclusivityUpholdStatus,
  meta: MetaSchema,
  transaction_status: "failed" | "successful" | "processing",
  provider: PaymentLedgerTypes["provider"],
  verifiedTransaction: any
) {
  const paymentFulfillmentStatus: PaymentLedgerTypes["payment_fulfillment"] = {
    transaction_created: "failed",
    sale_record_created: "failed",
    artwork_marked_sold: "failed",
    mass_orders_updated: "failed",
    seller_wallet_updated: "failed",
  };
  const nowUTC = toUTCDate(new Date());

  try {
    const { penalty_fee, commission } = buildPricing(
      meta,
      exclusivity_uphold_status
    );

    const pricing: PurchaseTransactionPricing = {
      amount_total: Math.round(Number(amount)),
      unit_price: Math.round(Number(meta.unit_price ?? 0)),
      shipping_cost: Math.round(Number(meta.shipping_cost ?? 0)),
      commission,
      tax_fees: Math.round(Number(meta.tax_fees ?? 0)),
      currency: "USD",
      penalty_fee: Math.round(penalty_fee),
    };

    const transaction: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
      trans_pricing: pricing,
      trans_date: nowUTC,
      trans_recipient_id: meta.seller_id ?? "",
      trans_initiator_id: meta.buyer_id ?? "",
      trans_recipient_role: "artist",
      trans_reference: transaction_id,
      status: transaction_status,
      createdBy: "webhook",
      webhookReceivedAt: new Date(),
      webhookConfirmed: true,
      provider,
    };

    // Perform DB update operations in a single promise
    const updates = await Promise.allSettled([
      handleWalletIncrement(pricing, meta.seller_id ?? "", transaction_id),
      createPurchaseTransactionEntry(transaction),
      updateSalesRecord(
        transaction_id,
        pricing.unit_price,
        meta.seller_id ?? ""
      ),
      updateArtworkRecordAsSold(meta.art_id ?? ""),
      updateMassOrderRecords(meta.art_id ?? "", meta.buyer_id ?? ""),
    ]);

    for (const result of updates) {
      if (result.status === "fulfilled") {
        const res = result.value;
        paymentFulfillmentStatus[
          res.step as keyof PaymentLedgerTypes["payment_fulfillment"]
        ] = res.status as "done" | "failed";
      } else {
        rollbarServerInstance.error({
          context: "Fulfillment promise rejected",
          reason: result.reason,
        });
      }
    }

    const paymentLedgerPayload: PaymentLedgerPayloadTypes = {
      meta,
      pricing,
      paymentObj: verifiedTransaction,
      provider: "flutterwave",
    };
    const isAllUpdatesDone = Object.values(paymentFulfillmentStatus).every(
      (status) => status === "done"
    );

    // Update the Payment Ledger with the fulfillment status
    const paymentLedgerUpdate = await PaymentLedger.updateOne(
      { provider_tx_id: transaction_id, provider: "flutterwave" },
      {
        $set: {
          payload: paymentLedgerPayload,
          payment_fulfillment: paymentFulfillmentStatus,
          payment_fulfillment_checks_done: isAllUpdatesDone,
        },
      }
    );
    if (paymentLedgerUpdate.modifiedCount === 0) {
      rollbarServerInstance.error({
        context: "Payment Ledger update failed",
        transaction_id,
      });
    }

    return true;
  } catch (error) {
    rollbarServerInstance.error({
      context: "Payment handling workflow crashed",
      transaction_id,
    });

    return false;
  }
}

export async function handleWalletIncrement(
  pricing: PurchaseTransactionPricing,
  seller_id: string,
  transaction_id: string
): Promise<FulfillmentStepResult> {
  const walletIncrement =
    pricing.amount_total -
    (pricing.commission +
      (pricing.penalty_fee ?? 0) +
      pricing.tax_fees +
      pricing.shipping_cost);
  try {
    const result = await Wallet.updateOne(
      {
        owner_id: seller_id,
        applied_payment_refs: { $ne: transaction_id },
      },
      {
        $inc: { pending_balance: walletIncrement },
        $push: { applied_payment_refs: transaction_id },
      }
    );

    // Case 1: Wallet updated successfully
    if (result.modifiedCount === 1) {
      return {
        step: "seller_wallet_updated",
        status: "done",
      };
    }

    // Case 2: Payment already applied → idempotent skip
    const alreadyApplied = await Wallet.exists({
      owner_id: seller_id,
      applied_payment_refs: transaction_id,
    });

    if (alreadyApplied) {
      return {
        step: "seller_wallet_updated",
        status: "done",
        reason: "payment_already_applied",
      };
    }

    // Case 3: Wallet missing or unexpected state
    rollbarServerInstance.error({
      context: "Wallet update anomaly",
      seller_id,
      transaction_id,
      walletIncrement,
    });

    return {
      step: "seller_wallet_updated",
      status: "failed",
      reason: "wallet_not_found_or_unexpected_state",
    };
  } catch (error) {
    rollbarServerInstance.error({
      context: "Wallet update crashed - Payment handling workflow",
      seller_id,
      transaction_id,
      walletIncrement,
      error,
    });

    return {
      step: "seller_wallet_updated",
      status: "failed",
      reason: "exception",
    };
  }
}

export async function createPurchaseTransactionEntry(
  transaction: Omit<PurchaseTransactionModelSchemaTypes, "trans_id">
): Promise<FulfillmentStepResult> {
  try {
    await PurchaseTransactions.updateOne(
      { trans_reference: transaction.trans_reference },
      { $setOnInsert: transaction },
      { upsert: true }
    );

    return {
      step: "transaction_created",
      status: "done",
    };
  } catch (error: any) {
    rollbarServerInstance.error({
      context: "Transaction creation failed",
      transaction_ref: transaction.trans_reference,
      error,
    });

    return {
      step: "transaction_created",
      status: "failed",
      reason: "exception",
    };
  }
}

export async function updateSalesRecord(
  tx_ref: string,
  unit_price: number,
  seller_id: string
) {
  const { month, year } = getCurrentMonthAndYear();

  try {
    await SalesActivity.updateOne(
      { trans_ref: tx_ref },
      {
        $setOnInsert: {
          month,
          year,
          value: unit_price,
          id: seller_id,
          trans_ref: tx_ref,
        },
      },
      { upsert: true }
    );

    return {
      step: "sale_record_created",
      status: "done",
    };
  } catch (error: any) {
    rollbarServerInstance.error({
      context: "Sale record creation failed",
      error,
    });

    return {
      step: "sale_record_created",
      status: "failed",
      reason: "exception",
    };
  }
}

export async function updateArtworkRecordAsSold(
  art_id: string
): Promise<FulfillmentStepResult> {
  try {
    const artwork = await Artworkuploads.findOneAndUpdate(
      { art_id, availability: true }, // 🔐 guard
      { $set: { availability: false } },
      { new: true }
    );

    // Case 1: We successfully marked it sold
    if (artwork) {
      try {
        await redis.del(`artwork:${art_id}`);
      } catch (cacheError) {
        rollbarServerInstance.warn({
          context: "Artwork cache update failed",
          art_id,
          cacheError,
        });
      }

      return {
        step: "artwork_marked_sold",
        status: "done",
      };
    }

    // Case 2: It was already sold (idempotent success)
    const alreadySold = await Artworkuploads.exists({
      art_id,
      availability: false,
    });

    if (alreadySold) {
      return {
        step: "artwork_marked_sold",
        status: "done",
        reason: "already_sold",
      };
    }

    // Case 3: Artwork does not exist
    rollbarServerInstance.error({
      context: "Artwork not found during fulfillment",
      art_id,
    });

    return {
      step: "artwork_marked_sold",
      status: "failed",
      reason: "artwork_not_found",
    };
  } catch (error) {
    rollbarServerInstance.error({
      context: "Artwork update crashed",
      art_id,
      error,
    });

    return {
      step: "artwork_marked_sold",
      status: "failed",
      reason: "exception",
    };
  }
}

async function updateMassOrderRecords(
  art_id: string,
  buyer_id: string
): Promise<FulfillmentStepResult> {
  try {
    const result = await CreateOrder.updateMany(
      {
        artwork_art_id: art_id,
        "buyer_details.id": { $ne: buyer_id },

        // 🔐 idempotency guard
        availability: { $ne: false },
      },
      {
        $set: { availability: false },
      }
    );

    // Case 1: We actually updated some records
    if (result.modifiedCount > 0) {
      return {
        step: "mass_orders_updated",
        status: "done",
      };
    }

    // Case 2: Already updated in a previous run (idempotent success)
    return {
      step: "mass_orders_updated",
      status: "done",
      reason: "already_updated",
    };
  } catch (error) {
    rollbarServerInstance.error({
      context: "Mass order update failed",
      art_id,
      buyer_id,
      error,
    });

    return {
      step: "mass_orders_updated",
      status: "failed",
      reason: "exception",
    };
  }
}
