import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { NextResponse } from "next/server";
import {
  BadRequestError,
  ServerError,
} from "../../../../custom/errors/dictionary/errorDictionary";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { sendOrderDeclinedMail } from "@omenai/shared-emails/src/models/orders/orderDeclinedMail";
import { strictRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import {
  CombinedConfig,
  ExclusivityUpholdStatus,
  NotificationPayload,
} from "@omenai/shared-types";
import { DeviceManagement } from "@omenai/shared-models/models/device_management/DeviceManagementSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import mongoose from "mongoose";
import { createErrorRollbarReport } from "../../util";

const config: CombinedConfig = {
  ...strictRateLimit,
  allowedRoles: ["artist", "gallery"],
};

interface DeclineOrderRequest {
  data: {
    status: string;
    reason: string;
  };
  order_id: string;
  seller_designation: "artist" | "gallery";
  art_id: string;
}

type ExclusivityStatus = Pick<
  ExclusivityUpholdStatus,
  "exclusivity_type" | "exclusivity_end_date"
>;

interface ArtworkExclusivityData {
  exclusivity_status: ExclusivityStatus;
  author_id: string;
}

function isCurrentDateGreaterOrEqual(targetDate: Date): boolean {
  const current = toUTCDate(new Date());
  return current.getTime() >= targetDate.getTime();
}

/**
 * Handles exclusivity breach for artist orders
 * Uses MongoDB transaction to ensure atomic updates
 */
async function handleExclusivityBreach(
  art_id: string,
  session: mongoose.ClientSession
): Promise<void> {
  const artwork = await Artworkuploads.findOne(
    { art_id },
    "exclusivity_status author_id"
  ).session(session);

  if (!artwork) {
    throw new ServerError(
      "Artwork not found. Please try again or contact support"
    );
  }

  const { exclusivity_status, author_id } = artwork as ArtworkExclusivityData;

  // Check if artist has breached exclusivity terms
  const hasExclusivityBreach =
    exclusivity_status.exclusivity_type === "exclusive" &&
    exclusivity_status.exclusivity_end_date &&
    !isCurrentDateGreaterOrEqual(exclusivity_status.exclusivity_end_date);

  if (hasExclusivityBreach) {
    // Update artist breach status and artwork availability atomically
    const [artistUpdate, artworkUpdate] = await Promise.all([
      AccountArtist.updateOne(
        { artist_id: author_id },
        {
          $set: {
            "exclusivity_uphold_status.isBreached": true,
          },
          $inc: { "exclusivity_uphold_status.incident_count": 1 },
        },
        { session }
      ),
      // Optionally change exclusivity status for artwork if necessary
      Artworkuploads.updateOne(
        { art_id },
        {
          $set: {
            availability: false,
          },
        },
        { session }
      ),
    ]);

    // Verify both updates succeeded
    if (artistUpdate.modifiedCount === 0 || artworkUpdate.modifiedCount === 0) {
      throw new ServerError(
        "Failed to update exclusivity breach status. Please try again or contact support"
      );
    }
  }
}

/**
 * Sends push notification to buyer
 * Non-critical operation - failures are logged but don't fail the request
 */
async function sendBuyerNotification(
  buyer_id: string,
  order_id: string
): Promise<void> {
  try {
    const buyer_device = await DeviceManagement.findOne(
      { auth_id: buyer_id },
      "device_push_token"
    );

    if (buyer_device?.device_push_token) {
      const notification: NotificationPayload = {
        to: buyer_device.device_push_token,
        title: "Order request declined",
        body: "Your order request has been declined",
        data: {
          type: "orders",
          access_type: "collector",
          metadata: {
            orderId: order_id,
            date: toUTCDate(new Date()),
          },
          userId: buyer_id,
        },
      };

      await createWorkflow(
        "/api/workflows/notification/pushNotification",
        `notification_workflow_buyer_${order_id}_${generateDigit(2)}`,
        JSON.stringify(notification)
      );
    }
  } catch (error) {
    // Log but don't throw - notification failure shouldn't fail the entire operation
    console.error("Failed to send buyer notification:", error);
    createErrorRollbarReport(
      "order: failed to send buyer notification",
      error as any,
      500
    );
  }
}

/**
 * Sends email notification to buyer
 * Non-critical operation - failures are logged but don't fail the request
 */
async function sendBuyerEmail(
  name: string,
  email: string,
  reason: string,
  artwork_data: any
): Promise<void> {
  try {
    await sendOrderDeclinedMail({
      name,
      email,
      reason,
      artwork_data,
    });
  } catch (error) {
    // Log but don't throw - email failure shouldn't fail the entire operation
    console.error("Failed to send order declined email:", error);
    createErrorRollbarReport(
      "order: failed to send order declined email",
      error as any,
      500
    );
  }
}

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request
) {
  const session = await mongoose.startSession();

  try {
    await connectMongoDB();

    // Parse and validate request body
    const body: DeclineOrderRequest = await request.json();
    const { data, order_id, seller_designation, art_id } = body;

    if (
      !data.status ||
      !data.reason ||
      !order_id ||
      !seller_designation ||
      !art_id
    ) {
      throw new BadRequestError("Missing required fields for operation");
    }

    // Start transaction for critical database operations
    session.startTransaction();

    // Handle exclusivity breach for artist orders
    if (seller_designation === "artist") {
      await handleExclusivityBreach(art_id, session);
    }

    // Update order status
    const declinedOrder = await CreateOrder.findOneAndUpdate(
      { order_id },
      {
        $set: {
          order_accepted: { status: data.status, reason: data.reason },
          status: "completed",
        },
      },
      { new: true, session }
    );

    if (!declinedOrder) {
      throw new ServerError("Order not found or could not be updated");
    }

    // Commit transaction - all critical operations succeeded
    await session.commitTransaction();

    // Send notifications asynchronously (non-critical operations)
    // These run after transaction commit to avoid blocking
    const notificationPromises = [
      sendBuyerNotification(
        declinedOrder.buyer_details.id,
        declinedOrder.order_id
      ),
      sendBuyerEmail(
        declinedOrder.buyer_details.name,
        declinedOrder.buyer_details.email,
        declinedOrder.order_accepted.reason,
        declinedOrder.artwork_data
      ),
    ];

    // Fire and forget - we don't await these
    Promise.allSettled(notificationPromises).catch((error) => {
      console.error("Notification batch failed:", error);
    });

    return NextResponse.json(
      {
        message: "Successfully declined order",
        data: {
          order_id: declinedOrder.order_id,
          status: declinedOrder.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Rollback transaction on any error
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "order: decline order request",
      error as any,
      error_response.status
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status }
    );
  } finally {
    // Always end the session
    await session.endSession();
  }
});
