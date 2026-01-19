import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import OrderDeclinedEmail from "@omenai/shared-emails/src/views/order/OrderDeclinedEmail";
import OrderAutoDeclinedEmail from "@omenai/shared-emails/src/views/order/OrderAutoDeclined";
import OrderRequestReminder from "@omenai/shared-emails/src/views/order/OrderRequessstReminder";
import OrderDeclinedWarning from "@omenai/shared-emails/src/views/order/OrderDeclinedWarning";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { render } from "@react-email/render";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { createErrorRollbarReport } from "../../../util";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ProcessedCounts {
  autoDeclined: number;
  warningsSent: number;
  remindersSent: number;
  emailErrors: number;
}

/**
 * Auto-declines orders older than 96 hours and sends notification emails
 */
async function processAutoDeclines(
  hours96Ago: Date,
  processedCounts: ProcessedCounts
): Promise<void> {
  // Use findOneAndUpdate in a loop to atomically process each order
  // This prevents race conditions and ensures we only email orders we actually updated
  const autoDeclinedOrders: CreateOrderModelTypes[] = [];

  let foundOrder;
  do {
    foundOrder = await CreateOrder.findOneAndUpdate(
      {
        updatedAt: { $lt: hours96Ago },
        "order_accepted.status": "", // Must be pending
      },
      {
        $set: {
          "order_accepted.status": "declined",
          "order_accepted.reason":
            "Seller did not respond within the designated timeframe",
        },
      },
      { new: true } // Return updated document
    );

    if (foundOrder) {
      autoDeclinedOrders.push(foundOrder);
    }
  } while (foundOrder && autoDeclinedOrders.length < 100); // Safety limit per run

  processedCounts.autoDeclined = autoDeclinedOrders.length;

  if (autoDeclinedOrders.length === 0) {
    return;
  }

  // Update artwork rejection counts and check for breaches
  await updateArtworkRejectionCounts(autoDeclinedOrders);

  try {
    // Render all emails concurrently
    const [buyerEmailPayload, sellerEmailPayload] = await Promise.all([
      // Buyer emails
      Promise.all(
        autoDeclinedOrders.map(async (order) => {
          const html = await render(
            OrderDeclinedEmail({
              recipientName: order.buyer_details.name,
              declineReason:
                "Seller did not respond within the designated timeframe",
              artwork: order.artwork_data,
            })
          );
          return {
            from: "Orders ",
            to: [order.buyer_details.email],
            subject: "Your order has been declined",
            html,
          };
        })
      ),
      // Seller emails
      Promise.all(
        autoDeclinedOrders.map(async (order) => {
          const html = await render(
            OrderAutoDeclinedEmail({
              name: order.seller_details.name,
              artwork: order.artwork_data,
            })
          );
          return {
            from: "Orders ",
            to: [order.seller_details.email],
            subject: "Order has been auto declined",
            html,
          };
        })
      ),
    ]);

    // Send both batches concurrently
    await Promise.all([
      resend.batch.send(buyerEmailPayload),
      resend.batch.send(sellerEmailPayload),
    ]);
  } catch (error) {
    console.error("Failed to send auto-decline emails:", error);
    processedCounts.emailErrors += autoDeclinedOrders.length * 2; // Buyer + seller emails
  }
}

/**
 * Sends warning emails for orders 72-96 hours old
 */
async function sendWarningEmails(
  hours72Ago: Date,
  hours96Ago: Date,
  processedCounts: ProcessedCounts
): Promise<void> {
  const orders72 = await CreateOrder.find({
    updatedAt: {
      $gte: hours96Ago, // More recent than 96 hours
      $lt: hours72Ago, // Older than 72 hours
    },
    "order_accepted.status": "",
  }).lean();

  if (orders72.length === 0) {
    return;
  }

  try {
    const warningEmailPayload = await Promise.all(
      orders72.map(async (order) => {
        const html = await render(
          OrderDeclinedWarning({ name: order.seller_details.name })
        );
        return {
          from: "Orders <omenai@omenai.app>",
          to: [order.seller_details.email],
          subject: "Notice: Potential Order Request Decline",
          html,
        };
      })
    );

    await resend.batch.send(warningEmailPayload);
    processedCounts.warningsSent = orders72.length;
  } catch (error) {
    console.error("Failed to send warning emails:", error);
    processedCounts.emailErrors += orders72.length;
  }
}

/**
 * Sends reminder emails for orders 24-72 hours old
 */
async function sendReminderEmails(
  hours24Ago: Date,
  hours72Ago: Date,
  processedCounts: ProcessedCounts
): Promise<void> {
  const orders24 = await CreateOrder.find({
    updatedAt: {
      $gte: hours72Ago, // More recent than 72 hours
      $lt: hours24Ago, // Older than 24 hours
    },
    "order_accepted.status": "",
  }).lean();

  if (orders24.length === 0) {
    return;
  }

  try {
    // Use consistent rendering approach
    const reminderEmailPayload = await Promise.all(
      orders24.map(async (order) => {
        const html = await render(
          OrderRequestReminder(order.seller_details.name)
        );
        return {
          from: "Orders <omenai@omenai.app>",
          to: [order.seller_details.email],
          subject: "Order Request Reminder",
          html,
        };
      })
    );

    await resend.batch.send(reminderEmailPayload);
    processedCounts.remindersSent = orders24.length;
  } catch (error) {
    console.error("Failed to send reminder emails:", error);
    processedCounts.emailErrors += orders24.length;
  }
}

// NOTE: Run every day at 00:00 UTC
export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  const startTime = Date.now();

  try {
    await connectMongoDB();

    const currentDate = toUTCDate(new Date());
    const hours24Ago = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    const hours72Ago = new Date(currentDate.getTime() - 72 * 60 * 60 * 1000);
    const hours96Ago = new Date(currentDate.getTime() - 96 * 60 * 60 * 1000);

    const processedCounts: ProcessedCounts = {
      autoDeclined: 0,
      warningsSent: 0,
      remindersSent: 0,
      emailErrors: 0,
    };

    // Process each category sequentially to avoid overwhelming the email service
    // 1. Auto-decline orders older than 96 hours (most critical)
    await processAutoDeclines(hours96Ago, processedCounts);

    // 2. Send warnings for orders 72-96 hours old
    await sendWarningEmails(hours72Ago, hours96Ago, processedCounts);

    // 3. Send reminders for orders 24-72 hours old
    await sendReminderEmails(hours24Ago, hours72Ago, processedCounts);

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        message: "Order management completed successfully",
        duration,
        ...processedCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Order management cron failed after ${duration}ms:`, error);

    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Cron: Check order request timestamp - update artwork rejection counts",
      error,
      error_response?.status
    );

    return NextResponse.json(
      {
        message: "Order management cron job failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

async function updateArtworkRejectionCounts(
  autoDeclinedOrders: CreateOrderModelTypes[]
): Promise<void> {
  try {
    // Step 1: Bulk increment rejection counts for all artworks
    const artworkBulkOps = autoDeclinedOrders.map((order) => ({
      updateOne: {
        filter: {
          art_id: order.artwork_data.art_id,
          author_id: order.seller_details.id, // As specified in requirements
        },
        update: {
          $inc: { "exclusivity_status.order_auto_rejection_count": 1 },
        },
      },
    }));

    if (artworkBulkOps.length === 0) return;

    const artworkUpdateResult = await Artworkuploads.bulkWrite(artworkBulkOps, {
      ordered: false, // Continue on errors
    });

    // Step 2: Find all artworks that now have count >= 3
    const artworkQueries = autoDeclinedOrders.map((order) => ({
      art_id: order.artwork_data.art_id,
      author_id: order.seller_details.id,
    }));

    const breachedArtworks = await Artworkuploads.find({
      $or: artworkQueries,
      "exclusivity_status.order_auto_rejection_count": { $gte: 3 },
    }).select("author_id");

    if (breachedArtworks.length === 0) {
      return;
    }

    // Step 3: Get unique author IDs and bulk update AccountArtist
    const uniqueAuthorIds = [
      ...new Set(breachedArtworks.map((artwork) => artwork.author_id)),
    ];

    const artistBulkWrites = [];
    const availabilityBulkWrites = [];

    for (const author_id of uniqueAuthorIds) {
      artistBulkWrites.push({
        updateOne: {
          filter: { artist_id: author_id },
          update: {
            $set: { "exclusivity_uphold_status.isBreached": true },
            $inc: { "exclusivity_uphold_status.incident_count": 1 },
          },
        },
      });
      availabilityBulkWrites.push({
        updateOne: {
          filter: { author_id },
          update: {
            $set: { availability: false },
          },
        },
      });
    }

    if (artistBulkWrites.length > 0) {
      const artistUpdateResult = await AccountArtist.bulkWrite(
        artistBulkWrites,
        {
          ordered: false, // Continue on errors
        }
      );

      if (availabilityBulkWrites.length > 0) {
        const availabilityUpdateResult = await Artworkuploads.bulkWrite(
          availabilityBulkWrites,
          { ordered: false }
        );
      }
    }
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    console.error("Failed to update artwork rejection counts:", error);
    // Don't throw an error here - this shouldn't block the email sending process
    createErrorRollbarReport(
      "Cron: Check order request timestamp - update artwork rejection counts",
      error,
      error_response?.status
    );
  }
}
