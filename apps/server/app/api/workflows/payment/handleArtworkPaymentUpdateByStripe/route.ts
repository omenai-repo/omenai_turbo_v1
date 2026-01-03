import {
  MetaSchema,
  PaymentLedgerPayloadTypes,
  PaymentLedgerTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
} from "@omenai/shared-types";
import { serve } from "@upstash/workflow/nextjs";
import { rollbarServerInstance } from "@omenai/rollbar-config";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { redis } from "@omenai/upstash-config";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";

type Payload = {
  provider: PaymentLedgerTypes["provider"];
  meta: MetaSchema & { commission: string };
  checkoutSession: any;
};

type FulfillmentStepResult = {
  step: keyof PaymentLedgerTypes["payment_fulfillment"];
  status: "done" | "failed";
  reason?: string;
};

export const { POST } = serve<Payload>(async (ctx) => {
  // Retrieve the payload here for use within your runs
  const { meta, checkoutSession }: Payload = ctx.requestPayload;

  // Implement your workflow logic within ctx.run
  const update_run = await ctx.run(
    "handle_artwork_payment_update_stripe",
    async () => {
      await connectMongoDB();

      const is_fulfillment_checked = (await PaymentLedger.findOne(
        {
          provider_tx_id: checkoutSession.id,
          provider: "stripe",
        },
        "payment_fulfillment_checks_done"
      ).lean()) as { payment_fulfillment_checks_done: boolean } | null;

      if (is_fulfillment_checked?.payment_fulfillment_checks_done) {
        return true;
      }
      const response: boolean = await handlePaymentTransactionUpdatesByStripe(
        checkoutSession,
        meta
      );

      return response;
    }
  );

  return Boolean(update_run);
});

async function createPurchaseTransactionEntry(
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

async function updateSalesRecord(
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

async function updateArtworkRecordAsSold(
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
    await CreateOrder.updateMany(
      {
        "artwork_data.art_id": art_id,
        "buyer_details.id": { $ne: buyer_id },
      },
      { $set: { availability: false } }
    );

    return {
      step: "mass_orders_updated",
      status: "done",
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

async function handlePaymentTransactionUpdatesByStripe(
  checkoutSession: any,
  meta: MetaSchema & { commission: string }
) {
  const paymentFulfillmentStatus: PaymentLedgerTypes["payment_fulfillment"] = {
    transaction_created: "failed",
    sale_record_created: "failed",
    artwork_marked_sold: "failed",
    mass_orders_updated: "failed",
  };
  const date = toUTCDate(new Date());

  try {
    const pricing: PurchaseTransactionPricing = {
      amount_total: Math.round(checkoutSession.amount_total / 100),
      unit_price: Math.round(+meta.unit_price),
      shipping_cost: Math.round(+meta.shipping_cost),
      commission: Math.round(+meta.commission),
      tax_fees: Math.round(+meta.tax_fees),
      currency: "USD",
    };

    const transaction: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
      trans_pricing: pricing,
      trans_date: date,
      trans_recipient_id: meta.seller_id,
      trans_initiator_id: meta.buyer_id,
      trans_recipient_role: "gallery",
      trans_reference: checkoutSession.id,
      status: "successful",
    };

    // Perform DB update operations in a single promise
    const updates = await Promise.allSettled([
      createPurchaseTransactionEntry(transaction),
      updateSalesRecord(
        checkoutSession.id,
        pricing.unit_price,
        meta.seller_id ?? ""
      ),
      updateArtworkRecordAsSold(meta.art_id ?? ""),
      updateMassOrderRecords(meta.art_id ?? "", meta.buyer_id ?? ""),
    ]);

    for (const result of updates) {
      if (result.status === "fulfilled" && result.value) {
        const res = result.value;
        paymentFulfillmentStatus[
          res.step as keyof PaymentLedgerTypes["payment_fulfillment"]
        ] = res.status as "done" | "failed";
      } else {
        rollbarServerInstance.error({
          context: "Fulfillment promise rejected",
        });
      }
    }

    const paymentLedgerPayload: PaymentLedgerPayloadTypes = {
      meta,
      pricing,
    };
    const isAllUpdatesDone = Object.values(paymentFulfillmentStatus).every(
      (status) => status === "done"
    );

    // Update the Payment Ledger with the fulfillment status
    const paymentLedgerUpdate = await PaymentLedger.updateOne(
      { provider_tx_id: checkoutSession.id, provider: "stripe" },
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
        transaction_id: checkoutSession.id,
      });
    }

    return true;
  } catch (error) {
    rollbarServerInstance.error({
      context: "Payment handling workflow crashed",
      transaction_id: checkoutSession.id,
    });

    return false;
  }
}
