import { withAppRouterHighlight } from "@omenai/shared-lib/highlight/app_router_highlight";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { getApiUrl } from "@omenai/url-config/src/config";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { sendGalleryShipmentSuccessfulMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
import { sendArtistFundUnlockEmail } from "@omenai/shared-emails/src/models/artist/sendArtistFundUnlockEmail";
import { createErrorRollbarReport } from "../../../util";

/**
 * Checks if a given date is at least two days in the past from now.
 * @param targetDate The date to compare against.
 * @returns {boolean} True if the date is 48 hours or more in the past.
 */
const isDateAtLeastTwoDaysPast = (targetDate: Date): boolean => {
  const now = new Date();
  const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000;
  return now.getTime() - targetDate.getTime() >= twoDaysInMillis;
};

/**
 * Process a single order: check delivery status and update order/wallet if delivered
 */
async function processOrder(order: any, dbConnection: any) {
  try {
    // Fetch the latest shipment status from the tracking API
    const response = await fetch(
      `${getApiUrl()}/api/shipment/shipment_tracking?order_id=${order.order_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://omenai.app",
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`API fetch failed with status ${response.status}`);
    }

    const trackingResult = await response.json();

    // Validate response structure
    if (!trackingResult?.events || !Array.isArray(trackingResult.events)) {
      throw new Error("Invalid tracking API response structure");
    }

    if (trackingResult.events.length === 0) {
      return {
        status: "skipped",
        order_id: order.order_id,
        reason: "No tracking events found",
      };
    }

    const latestEvent = trackingResult.events.at(-1);

    // Proceed only if the latest status is "Delivered"
    if (latestEvent?.description !== "Delivered") {
      return {
        status: "skipped",
        order_id: order.order_id,
        reason: `Current status: ${latestEvent?.description || "Unknown"}`,
      };
    }

    // Validate required fields before starting transaction
    const { seller_designation, seller_details, payment_information } = order;
    const wallet_increment_amount =
      payment_information?.artist_wallet_increment;

    if (seller_designation === "artist" && !seller_details?.id) {
      throw new Error("Missing id for artist order");
    }

    if (seller_designation === "artist" && !wallet_increment_amount) {
      throw new Error("Missing wallet_increment_amount for artist order");
    }

    // Use a transaction to update the order and wallet atomically
    const session = await dbConnection.startSession();

    try {
      await session.withTransaction(async () => {
        // Update order status to "completed"
        const orderUpdateResult = await CreateOrder.updateOne(
          { order_id: order.order_id, status: "processing" }, // Add status check to prevent race conditions
          {
            $set: {
              status: "completed",
              "shipping_details.shipment_information.tracking.delivery_status":
                "Delivered",
              "shipping_details.shipment_information.tracking.delivery_date":
                toUTCDate(new Date(latestEvent.date)),
              "shipping_details.delivery_confirmed": true,
            },
          },
          { session }
        );

        if (orderUpdateResult.matchedCount === 0) {
          throw new Error("Order not found or already processed");
        }

        // If the seller is an artist, release their funds
        if (seller_designation === "artist" && wallet_increment_amount) {
          // First check if wallet exists
          const walletExists = await Wallet.findOne(
            { owner_id: seller_details.id },
            { _id: 1 },
            { session }
          );

          if (!walletExists) {
            throw new Error(
              `Wallet not found for seller ${seller_details.id}. Escalate to IT support.`
            );
          }

          // Update wallet balance
          const walletUpdateResult = await Wallet.updateOne(
            {
              owner_id: seller_details.id,
              pending_balance: { $gte: wallet_increment_amount },
            },
            {
              $inc: {
                pending_balance: -wallet_increment_amount,
                available_balance: wallet_increment_amount,
              },
            },
            { session }
          );

          if (walletUpdateResult.matchedCount === 0) {
            throw new Error(
              `Insufficient pending balance (${wallet_increment_amount} required) or wallet concurrency issue`
            );
          }

          if (walletUpdateResult.modifiedCount === 0) {
            throw new Error("Wallet update failed - no changes made");
          }

          console.log(
            `✓ Order ${order.order_id}: Released ${wallet_increment_amount} to seller ${seller_details.id}`
          );

          // TODO: Send notification emails
          if (seller_designation === "artist") {
            // - Artist: Notify about fund unlock
            await sendArtistFundUnlockEmail({
              name: seller_details.name,
              email: seller_details.email,
              amount: wallet_increment_amount,
            });
          } else {
            // - Gallery: Notify about successful delivery
            await sendGalleryShipmentSuccessfulMail({
              name: seller_details.name,
              email: seller_details.email,
              trackingCode: order.order_id,
              artistName: order.seller_details.name,
              artworkImage: order.artwork_data.url,
              artwork: order.artwork_data.title,
              artworkPrice: order.artwork_data.pricing.usd_price,
            });
          }
        }
      });

      return {
        status: "success",
        order_id: order.order_id,
        funds_released:
          seller_designation === "artist" ? wallet_increment_amount : 0,
      };
    } finally {
      await session.endSession();
    }
  } catch (error) {
    // Capture errors on a per-order basis without stopping the entire cron job
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`✗ Failed to process order ${order.order_id}:`, errorMessage);

    createErrorRollbarReport(
      "Cron: Check shipment delivery status",
      errorMessage,
      50
    );
    return {
      status: "failed",
      order_id: order.order_id,
      reason: errorMessage,
    };
  }
}

/**
 * Cron job endpoint to validate shipment deliveries and release funds
 */
export const GET = withAppRouterHighlight(async function GET(request: Request) {
  const startTime = Date.now();

  try {
    const dbConnection = await connectMongoDB();

    // Fetch processing orders with valid shipment IDs
    const processingOrders = await CreateOrder.find(
      {
        status: "processing",
        "shipping_details.shipment_information.tracking.id": {
          $exists: true,
          $ne: null,
        },
        "order_accepted.status": "accepted",
        "shipping_details.shipment_information.estimates.estimatedDeliveryDate":
          {
            $exists: true,
            $ne: null,
          },
        "shipping_details.shipment_information.tracking.delivery_status":
          "In Transit",
      },
      "order_id shipping_details seller_designation payment_information seller_details"
    ).lean();

    console.log(`Found ${processingOrders.length} orders in processing status`);

    // Filter orders where the estimated delivery date is at least two days past
    const eligibleOrders = processingOrders.filter((order) => {
      const estimatedDeliveryDateStr =
        order.shipping_details?.shipment_information?.estimates
          ?.estimatedDeliveryDate;

      if (!estimatedDeliveryDateStr) {
        console.warn(
          `Order ${order.order_id}: Missing estimated delivery date`
        );
        return false;
      }

      try {
        const deliveryDate = toUTCDate(new Date(estimatedDeliveryDateStr));

        console.log(deliveryDate);
        console.log(isDateAtLeastTwoDaysPast(deliveryDate));
        return isDateAtLeastTwoDaysPast(deliveryDate);
      } catch (error) {
        console.error(`Order ${order.order_id}: Invalid delivery date format`);
        return false;
      }
    });

    console.log(
      `${eligibleOrders.length} orders eligible for validation (2+ days past delivery date)`
    );

    if (eligibleOrders.length === 0) {
      const res_payload = {
        message: "No orders eligible for delivery validation",
        total_processing: processingOrders.length,
        eligible: 0,
        execution_time_ms: Date.now() - startTime,
      };

      console.log(res_payload);
      return NextResponse.json({ ...res_payload }, { status: 200 });
    }

    // Process all eligible orders in parallel with concurrency limit
    const BATCH_SIZE = 10; // Process 10 orders at a time to avoid overwhelming the API
    const results = [];

    for (let i = 0; i < eligibleOrders.length; i += BATCH_SIZE) {
      const batch = eligibleOrders.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} orders)`
      );

      const batchPromises = batch.map((order) =>
        processOrder(order, dbConnection)
      );
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
    }

    // Aggregate results
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "success"
    );

    const skipped = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === "skipped"
    );

    const failed = results.filter(
      (r) =>
        r.status === "rejected" ||
        (r.status === "fulfilled" && r.value.status === "failed")
    );

    const totalFundsReleased = successful.reduce((sum, r) => {
      return sum + (r.status === "fulfilled" ? r.value.funds_released || 0 : 0);
    }, 0);

    const failedOrders = failed.map((r) =>
      r.status === "rejected"
        ? {
            order_id: "unknown",
            reason: r.reason?.message || "Rejected promise",
          }
        : r.value
    );

    const executionTime = Date.now() - startTime;

    console.log(`
Cron Job Summary:
- Total Processing Orders: ${processingOrders.length}
- Eligible for Check: ${eligibleOrders.length}
- Successfully Updated: ${successful.length}
- Skipped (Not Delivered): ${skipped.length}
- Failed: ${failed.length}
- Total Funds Released: ${totalFundsReleased}
- Execution Time: ${executionTime}ms
    `);

    return NextResponse.json(
      {
        message: "Cron job completed successfully",
        summary: {
          total_processing_orders: processingOrders.length,
          eligible_for_check: eligibleOrders.length,
          successful_updates: successful.length,
          skipped: skipped.length,
          failed_updates: failed.length,
          total_funds_released: totalFundsReleased,
          execution_time_ms: executionTime,
        },
        failed_orders: failedOrders.length > 0 ? failedOrders : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Critical cron job error:", error);
    const errorResponse = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "Cron: Check shipment delivery status",
      error,
      errorResponse?.status
    );

    return NextResponse.json(
      {
        message: errorResponse?.message || "Critical cron job failure",
        execution_time_ms: Date.now() - startTime,
      },
      { status: errorResponse?.status || 500 }
    );
  }
});
