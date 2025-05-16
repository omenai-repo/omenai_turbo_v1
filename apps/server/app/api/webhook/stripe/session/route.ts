import { sendPaymentSuccessGalleryMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessGalleryMail";
import { sendPaymentSuccessMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMail";
import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import {
  PaymentStatusTypes,
  PurchaseTransactionModelSchemaTypes,
  PurchaseTransactionPricing,
} from "@omenai/shared-types";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { NextResponse } from "next/server";

export const POST = withAppRouterHighlight(async function POST(
  request: Request
) {
  const secretHash = process.env.STRIPE_CHECKOUT_SESSION_WEBHOOK_SECRET!;
  const rawBody = await request.text();

  let event;
  if (secretHash) {
    const signature = request.headers.get("stripe-signature");
    try {
      event = await stripe.webhooks.constructEvent(
        rawBody,
        signature,
        secretHash
      );
    } catch (err) {
      console.error(`⚠️  Webhook signature verification failed.`, err);
      return NextResponse.json({ status: 400 });
    }
  }

  if (event.type === "checkout.session.completed") {
    const paymentIntent = event.data.object;
    if (
      paymentIntent.status !== "complete" ||
      paymentIntent.payment_status !== "paid"
    ) {
      return NextResponse.json({ status: 400 });
    }

    let transaction_id;
    const client = await connectMongoDB();
    const session = await client.startSession();
    const currency = getCurrencySymbol(paymentIntent.currency.toUpperCase());
    const formatted_date = getFormattedDateTime();
    const date = toUTCDate(new Date());
    const meta = paymentIntent.metadata;

    const order_info = await CreateOrder.findOne(
      {
        "buyer_details.email": meta.buyer_email,
        "artwork_data.art_id": meta.art_id,
      },
      "artwork_data order_id createdAt buyer_details"
    );
    try {
      await CreateOrder.updateOne(
        { order_id: order_info.order_id },
        { $set: { hold_status: null } }
      );

      session.startTransaction();

      // Check if the transaction already exists
      const existingTransaction = await PurchaseTransactions.findOne({
        trans_reference: paymentIntent.id,
      }).session(session);

      if (existingTransaction) {
        console.log("Transaction already processed.");
        await session.abortTransaction();
        return NextResponse.json({ status: 200 });
      }

      const payment_information: PaymentStatusTypes = {
        status: "completed",
        transaction_value: formatPrice(
          paymentIntent.amount_total / 100,
          currency
        ),
        transaction_date: formatted_date,
        transaction_reference: paymentIntent.id,
      };

      const updateOrderPromise = CreateOrder.updateOne(
        {
          "buyer_details.email": meta.buyer_email,
          "artwork_data.art_id": meta.art_id,
        },
        {
          $set: {
            payment_information,
          },
        }
      ).session(session);

      const transaction_pricing: PurchaseTransactionPricing = {
        amount_total: Math.round(paymentIntent.amount_total / 100),
        unit_price: Math.round(+meta.unit_price),
        shipping_cost: Math.round(+meta.shipping_cost),
        commission: Math.round(+meta.commission),
        tax_fees: Math.round(+meta.tax_fees),
      };

      const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
        trans_pricing: transaction_pricing,
        trans_date: date,
        trans_recipient_id: meta.seller_id,
        trans_initiator_id: meta.buyer_id,
        trans_recipient_role: "gallery",
        trans_reference: paymentIntent.id,
      };

      const createTransactionPromise = PurchaseTransactions.create([data], {
        session,
      });

      const updateArtworkPromise = Artworkuploads.updateOne(
        { art_id: meta.art_id },
        { $set: { availability: false } }
      ).session(session);

      const { month, year } = getCurrentMonthAndYear();
      const activity = {
        month,
        year,
        value: meta.unit_price,
        id: meta.seller_id,
        trans_ref: data.trans_reference,
      };

      const createSalesActivityPromise = SalesActivity.create([activity], {
        session,
      });

      const updateManyOrdersPromise = CreateOrder.updateMany(
        {
          "artwork_data.art_id": meta.art_id,
          "buyer_details.id": { $ne: meta.buyer_id },
        },
        { $set: { availability: false } }
      ).session(session);

      const [createTransactionResult] = await Promise.all([
        createTransactionPromise,
        updateOrderPromise,
        updateArtworkPromise,
        createSalesActivityPromise,
        updateManyOrdersPromise,
      ]);

      transaction_id = createTransactionResult[0].trans_id;

      await session.commitTransaction();
      const price = formatPrice(paymentIntent.amount_total / 100, currency);

      await createWorkflow(
        "/api/workflows/shipment/create_shipment",
        `create_shipment_${generateDigit(6)}`,
        JSON.stringify({ order_id: order_info.order_id })
      );

      await createWorkflow(
        "/api/workflows/emails/sendPaymentSuccessMail",
        `send_payment_success_mail${generateDigit(6)}`,
        JSON.stringify({
          buyer_email: meta.buyer_email,
          buyer_name: order_info.buyer_details.name,
          artwork_title: order_info.artwork_data.title,
          order_id: order_info.order_id,
          order_date: order_info.createdAt,
          transaction_id: transaction_id,
          price,
          seller_email: meta.seller_email,
          seller_name: meta.seller_name,
        })
      );
      console.log("Transaction committed.");
    } catch (error) {
      console.error("An error occurred during the transaction:", error);
      await session.abortTransaction();
      return NextResponse.json({ status: 400 });
    } finally {
      await session.endSession();
    }
  }

  if (event.type === "checkout.session.expired") {
    const paymentIntent = event.data.object;
    const meta = paymentIntent.metadata;

    await releaseOrderLock(meta.art_id, meta.buyer_id);
  }

  return NextResponse.json({ status: 200 });
});
