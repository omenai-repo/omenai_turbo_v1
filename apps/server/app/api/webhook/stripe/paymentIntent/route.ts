import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { stripe } from "@omenai/shared-lib/payments/stripe/stripe";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/TransactionSchema";
import { PurchaseTransactionModelSchemaTypes } from "@omenai/shared-types";
import { getCurrencySymbol } from "@omenai/shared-utils/src/getCurrencySymbol";
import { getCurrentMonthAndYear } from "@omenai/shared-utils/src/getCurrentMonthAndYear";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import { NextResponse } from "next/server";
import { getFormattedDateTime } from "@omenai/shared-utils/src/getCurrentDateTime";
import { formatIntlDateTime } from "@omenai/shared-utils/src/formatIntlDateTime";
import { releaseOrderLock } from "@omenai/shared-services/orders/releaseOrderLock";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";
import { sendPaymentPendingMail } from "@omenai/shared-emails/src/models/payment/sendPaymentPendingMail";
import { sendPaymentSuccessGalleryMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessGalleryMail";
import { sendPaymentSuccessMail } from "@omenai/shared-emails/src/models/payment/sendPaymentSuccessMail";

export async function POST(request: Request) {
  const secretHash = process.env.STRIPE_PAYMENT_INTENT_WEBHOOK_SECRET!;
  const rawBody = await request.text();

  let event;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (secretHash) {
    // Get the signature sent by Stripe
    const signature = request.headers.get("stripe-signature");
    try {
      event = await stripe.webhooks.constructEvent(
        rawBody,
        signature,
        secretHash
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err);
      return NextResponse.json({ status: 400 });
    }
  }

  const paymentIntent = event.data.object;
  const meta = paymentIntent.metadata;

  const client = await connectMongoDB();

  const email_order_info = await CreateOrder.findOne(
    {
      "buyer.email": meta.user_email,
      "artwork_data.art_id": meta.art_id,
    },
    "artwork_data order_id createdAt buyer"
  );

  if (event.type === "payment_intent.succeeded") {
    // Then define and call a method to handle the successful payment intent.
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ status: 400 });
    }

    let transaction_id;

    // Retrieve the MongoDB Client

    // Create a session with the initialized MongoClient
    const session = await client.startSession();

    const currency = getCurrencySymbol(paymentIntent.currency.toUpperCase());
    const formatted_date = getFormattedDateTime();
    const date = new Date();

    try {
      // Create a session transaction to group multiple database operations
      // A session transaction ensures that all operations are successful before it it being commited to the DB, if a single error occurs in any operation,
      // the updates are rolled back and the entire process is aborted.

      session.startTransaction();

      //   Update Order Payment Information

      // Create the update info
      const payment_information = {
        status: "completed",
        transaction_value: formatPrice(
          paymentIntent.amount_received / 100,
          currency
        ),
        transaction_date: formatted_date,
        transaction_reference: paymentIntent.id,
      };

      // Apply update to CreateOrder collection
      await CreateOrder.updateOne(
        {
          "buyer.email": meta.user_email,
          "artwork_data.art_id": meta.art_id,
        },
        {
          $set: {
            payment_information,
          },
        }
      );

      // Update transaction collection
      const data: Omit<PurchaseTransactionModelSchemaTypes, "trans_id"> = {
        trans_amount: formatPrice(
          paymentIntent.amount_received / 100,
          currency
        ),
        trans_date: date,
        trans_gallery_id: meta.gallery_id,
        trans_owner_id: meta.user_id,
        trans_owner_role: "user",
        trans_reference: paymentIntent.id,
        trans_type: "purchase_payout",
      };

      const create_transaction = await PurchaseTransactions.create(data);

      // Update Artwork Availability to false
      await Artworkuploads.updateOne(
        { art_id: meta.art_id },
        { $set: { availability: false } }
      );

      // Add this transaction to sales activity for revenue representation
      const { month, year } = getCurrentMonthAndYear();
      const activity = {
        month,
        year,
        value: paymentIntent.amount_received / 100,
        gallery_id: meta.gallery_id,
      };

      await SalesActivity.create({ ...activity });

      // Clear the order lock on the artwork
      await releaseOrderLock(meta.art_id, meta.user_id);

      await CreateOrder.updateMany(
        {
          "artwork_data.art_id": meta.art_id,
          "buyer.user_id": { $ne: meta.user_id },
        },
        { $set: { availability: false } }
      );

      transaction_id = create_transaction.trans_id;

      // Once all operations are run with no errors, commit the transaction
      await session.commitTransaction();

      console.log("Transaction committed.");
    } catch (error) {
      console.log("An error occurred during the transaction:" + error);

      // If any errors are encountered, abort the transaction process, this rolls back all updates and ensures that the DB isn't written to.
      await session.abortTransaction();
      // Exit the webhook
      return NextResponse.json({ status: 400 });
    } finally {
      // End the session to avoid reusing the same Mongoclient for different transactions
      await session.endSession();
    }

    // Catch error above

    const price = formatPrice(paymentIntent.amount_received / 100, currency);

    await sendPaymentSuccessMail({
      email: meta.user_email,
      name: email_order_info.buyer.name,
      artwork: email_order_info.artwork_data.title,
      order_id: email_order_info.order_id,
      order_date: formatIntlDateTime(email_order_info.createdAt),
      transaction_Id: transaction_id,
      price,
    });

    // Send mail to gallery
    await sendPaymentSuccessGalleryMail({
      email: meta.gallery_email,
      name: meta.gallery_name,
      artwork: meta.artwork_name,
      order_id: email_order_info.order_id,
      order_date: formatIntlDateTime(email_order_info.createdAt),
      transaction_Id: transaction_id,
      price,
    });
  }

  if (event.type === "payment_intent.processing") {
    await sendPaymentPendingMail({
      email: meta.user_email,
      name: email_order_info.buyer.name,
      artwork: email_order_info.artwork_data.title,
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    await sendPaymentFailedMail({
      email: meta.user_email,
      name: email_order_info.buyer.name,
      artwork: email_order_info.artwork_data.title,
      order_id: email_order_info.order_id,
    });
  }

  const release_lock_status = await releaseOrderLock(meta.art_id, meta.user_id);

  if (!release_lock_status?.isOk) return NextResponse.json({ status: 400 });
  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ status: 200 });
}
