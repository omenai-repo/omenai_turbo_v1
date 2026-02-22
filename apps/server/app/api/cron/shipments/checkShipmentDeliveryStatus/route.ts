import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { sendGalleryShipmentSuccessfulMail } from "@omenai/shared-emails/src/models/gallery/sendGalleryShipmentSuccessfulMail";
import { sendArtistFundUnlockEmail } from "@omenai/shared-emails/src/models/artist/sendArtistFundUnlockEmail";
import { createErrorRollbarReport } from "../../../util";
import { standardRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { verifyAuthVercel } from "../../utils";
import { UnifiedTrackingResponse, getDHLTracking } from "../../../dhl_service";
import { getUPSTracking } from "../../../ups_service";

/**
 * Checks if a given date is at least two days in the past from now.
 * NOTE: This means we only check tracking for orders that are 2 days PAST their ETA?
 * Please verify if this business logic is intentional. usually you check all "In Transit" orders.
 */
const isDateAtLeastTwoDaysPast = (targetDate: Date): boolean => {
  const now = new Date();
  const twoDaysInMillis = 1 * 24 * 60 * 60 * 1000;
  return now.getTime() - targetDate.getTime() >= twoDaysInMillis;
};

/**
 * Helper to fetch tracking based on carrier
 */
async function retrieveUnifiedTracking(
  order: any,
): Promise<UnifiedTrackingResponse | null> {
  const carrier = order.shipping_details?.shipment_information?.carrier
    .split(" ")[0]
    ?.toUpperCase();
  const trackingId = order.shipping_details?.shipment_information?.tracking?.id;

  if (!trackingId) return null;

  try {
    if (carrier === "DHL") {
      return await getDHLTracking(trackingId);
    } else if (carrier === "UPS") {
      return await getUPSTracking(trackingId);
    }
    return null;
  } catch (error) {
    console.error(`Tracking failed for ${order.order_id} (${carrier}):`, error);
    return null;
  }
}

async function processOrder(order: any, dbConnection: any) {
  try {
    // 1. GET UNIFIED TRACKING DATA
    const trackingResult = await retrieveUnifiedTracking(order);

    if (!trackingResult) {
      return {
        status: "skipped",
        order_id: order.order_id,
        reason: "Tracking service returned null or unsupported carrier",
      };
    }

    // 2. CHECK STATUS (The Clean "Unified" Way)
    // We strictly look for "DELIVERED". The Service layer handles the mapping (e.g. UPS "D" -> "DELIVERED")
    if (trackingResult.current_status !== "DELIVERED") {
      return {
        status: "skipped",
        order_id: order.order_id,
        reason: `Current status is ${trackingResult.current_status}`,
      };
    }

    // 3. PREPARE FOR UPDATE
    const latestEvent = trackingResult.events[0]; // Events are sorted Newest -> Oldest in our service
    const deliveryDate = latestEvent
      ? new Date(latestEvent.timestamp)
      : new Date();

    const { seller_designation, seller_details, payment_information } = order;
    const wallet_increment_amount =
      payment_information?.artist_wallet_increment;

    if (seller_designation === "artist" && !seller_details?.id) {
      throw new Error("Missing id for artist order");
    }

    if (seller_designation === "artist" && !wallet_increment_amount) {
      throw new Error("Missing wallet_increment_amount for artist order");
    }

    // 4. TRANSACTION EXECUTION
    const session = await dbConnection.startSession();

    try {
      await session.withTransaction(async () => {
        // Update order status to "completed"
        const orderUpdateResult = await CreateOrder.updateOne(
          { order_id: order.order_id, status: "processing" },
          {
            $set: {
              status: "completed",
              "shipping_details.shipment_information.tracking.delivery_status":
                "Delivered",
              // Use the actual event date, or fallback to now
              "shipping_details.shipment_information.tracking.delivery_date":
                toUTCDate(deliveryDate),
              "shipping_details.delivery_confirmed": true,
            },
          },
          { session },
        );

        if (orderUpdateResult.matchedCount === 0) {
          throw new Error("Order not found or already processed");
        }

        // Fund Release Logic (Artist Only)
        if (seller_designation === "artist" && wallet_increment_amount) {
          const walletExists = await Wallet.findOne(
            { owner_id: seller_details.id },
            { _id: 1 },
            { session },
          );

          if (!walletExists) {
            throw new Error(`Wallet not found for seller ${seller_details.id}`);
          }

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
            { session },
          );

          if (walletUpdateResult.matchedCount === 0) {
            throw new Error(
              `Insufficient pending balance or concurrency issue`,
            );
          }

          // Emails
          if (seller_designation === "artist") {
            await sendArtistFundUnlockEmail({
              name: seller_details.name,
              email: seller_details.email,
              amount: wallet_increment_amount,
            });
          }
        }

        // Gallery Email (Outside the Artist check)
        if (
          seller_designation === "gallery" ||
          seller_designation === "artist"
        ) {
          if (seller_designation === "gallery") {
            await sendGalleryShipmentSuccessfulMail({
              name: seller_details.name,
              email: seller_details.email,
              trackingCode: order.order_id,
              artworkImage: order.artwork_data.url,
              artwork: order.artwork_data.title,
              artistName: order.artwork_data.artist,
              price: order.artwork_data.pricing.usd_price,
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`✗ Failed to process order ${order.order_id}:`, errorMessage);

    createErrorRollbarReport(
      "Cron: Check shipment delivery status",
      errorMessage,
      50,
    );
    return {
      status: "failed",
      order_id: order.order_id,
      reason: errorMessage,
    };
  }
}

export const GET = withRateLimit(standardRateLimit)(async function GET(
  request: Request,
) {
  const startTime = Date.now();

  try {
    await verifyAuthVercel(request);
    const dbConnection = await connectMongoDB();

    // Fetch processing orders
    // NOTE: We only fetch orders where status is "In Transit" or similar
    const processingOrders = await CreateOrder.find(
      {
        status: "processing",
        "shipping_details.shipment_information.tracking.id": {
          $exists: true,
          $ne: null,
        },
        "order_accepted.status": "accepted",
        // We look for orders that *think* they are still in transit
        // This regex allows for "In Transit", "In_Transit", "Shipped", etc.
        "shipping_details.shipment_information.tracking.delivery_status": {
          $in: ["In Transit", "Shipped", "Origin Scan"],
        },

        // Ensure we have an ETA to check against
        "shipping_details.shipment_information.estimates.estimatedDeliveryDate":
          { $exists: true, $ne: null },
      },
      "order_id shipping_details seller_designation payment_information seller_details artwork_data createdAt buyer_details",
    ).lean();

    // Filter Logic
    const eligibleOrders = processingOrders.filter((order) => {
      const estimatedDeliveryDateStr =
        order.shipping_details?.shipment_information?.estimates
          ?.estimatedDeliveryDate;

      // Safety check
      if (!estimatedDeliveryDateStr) return false;

      try {
        const deliveryDate = toUTCDate(new Date(estimatedDeliveryDateStr));
        // Preserving your logic: Only check if 2 days PAST the estimated date
        return isDateAtLeastTwoDaysPast(deliveryDate);
      } catch (error) {
        return false;
      }
    });

    if (eligibleOrders.length === 0) {
      return NextResponse.json(
        {
          message: "No orders eligible for delivery validation",
          total_processing: processingOrders.length,
          eligible: 0,
          execution_time_ms: Date.now() - startTime,
        },
        { status: 200 },
      );
    }

    // Process in Batches
    const BATCH_SIZE = 10;
    const results = [];

    for (let i = 0; i < eligibleOrders.length; i += BATCH_SIZE) {
      const batch = eligibleOrders.slice(i, i + BATCH_SIZE);
      // Wait for all promises in batch to settle
      const batchResults = await Promise.all(
        batch.map((order) => processOrder(order, dbConnection)),
      );
      results.push(...batchResults);
    }

    // Metrics
    const successful = results.filter((r) => r.status === "success");
    const failed = results.filter((r) => r.status === "failed");
    const skipped = results.filter((r) => r.status === "skipped");

    const totalFundsReleased = successful.reduce(
      (sum, r) => sum + (r.funds_released || 0),
      0,
    );

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
          execution_time_ms: Date.now() - startTime,
        },
        failed_orders: failed.length > 0 ? failed : undefined,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Critical cron job error:", error);
    const errorResponse = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "Cron: Check shipment delivery status",
      error,
      errorResponse?.status,
    );

    return NextResponse.json(
      { message: errorResponse?.message || "Critical cron job failure" },
      { status: errorResponse?.status || 500 },
    );
  }
});
