import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ScheduledShipment } from "@omenai/shared-models/models/orders/CreateShipmentSchedule";
import { isWithinInterval, addDays } from "date-fns";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import {
  BadRequestError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { lenientRateLimit } from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimit } from "@omenai/shared-lib/auth/middleware/rate_limit_middleware";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import {
  AddressTypes,
  ArtworkSchemaTypes,
  CreateOrderModelTypes,
} from "@omenai/shared-types";
import { sendShipmentPickupReminderMail } from "@omenai/shared-emails/src/models/shipment/sendShipmentPickupReminderMail";
import { createErrorRollbarReport } from "../../../util";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
// Run every hour
// Utility function to send reminder emails
async function sendReminderEmail(
  email: string,
  orderId: string,
  isReminded: boolean,
  days: number,
  name: string,
  artwork: Pick<ArtworkSchemaTypes, "title" | "artist" | "art_id">,
  buyerName: string,
  pickupAddress: AddressTypes,
  artistName: string,
  artworkImage: string,
  artworkPrice: number,
  requestDate: string,
  estimatedPickupDate?: string
): Promise<void> {
  if (isReminded) {
    console.log(`🔁 Reminder already sent for order_id: ${orderId}, skipping.`);
    return;
  }
  console.log(`🟡 Sending reminder email for order_id: ${orderId}`);
  // DONE: Implement actual email sending logic here

  await ScheduledShipment.updateOne(
    { order_id: orderId },
    { $set: { reminderSent: true } }
  );

  const daysLeft = Math.floor(days).toString();
  const artworkImageUrl = getImageFileView(artworkImage, 120);
  await sendShipmentPickupReminderMail({
    name,
    email,
    artwork,
    orderId,
    buyerName,
    pickupAddress,
    daysLeft,
    estimatedPickupDate,
    artworkImage: artworkImageUrl,
    artistName,
    price: formatPrice(artworkPrice),
  });
}

// Utility function to update shipment status
async function updateShipmentStatus(
  orderId: string,
  status: string
): Promise<void> {
  const result = await ScheduledShipment.updateOne(
    { order_id: orderId },
    { $set: { status } }
  );
  if (result.modifiedCount === 0) {
    throw new Error(`Failed to update status for order_id: ${orderId}`);
  }
}

async function triggerShipmentWorkflow(orderId: string): Promise<void> {
  console.log(`🚀 Triggering workflow for order_id: ${orderId}`);
  const workflowID = await createWorkflow(
    "/api/workflows/shipment/create_shipment",
    `test_workflow${generateDigit(2)}`,
    JSON.stringify({ order_id: orderId })
  );
  if (!workflowID) throw new ServerError("Workflow failed");
}

// Batch processing helper
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export const GET = withRateLimit(lenientRateLimit)(async function GET() {
  try {
    await connectMongoDB();
    const nowUTC = toUTCDate(new Date());
    const shipments = await ScheduledShipment.find({ status: "scheduled" });
    if (!shipments.length) {
      console.log("No scheduled shipments to process.");
      return NextResponse.json(
        { message: "No scheduled shipments." },
        { status: 200 }
      );
    }

    const BATCH_SIZE = 10;
    const shipmentBatches = chunkArray(shipments, BATCH_SIZE);

    for (const batch of shipmentBatches) {
      await Promise.allSettled(
        batch.map(async (shipment) => {
          const executeAtUTC = toUTCDate(new Date(shipment.executeAt));
          const twoDaysBeforeExecuteUTC = toUTCDate(addDays(executeAtUTC, -2));

          // Check if it's time to send a reminder email
          if (
            isWithinInterval(nowUTC, {
              start: twoDaysBeforeExecuteUTC,
              end: executeAtUTC,
            })
          ) {
            const order: CreateOrderModelTypes | null =
              await CreateOrder.findOne({
                order_id: shipment.order_id,
              });

            // TODO: Implement proper error logging to scale
            if (!order) throw new BadRequestError("Order not found");
            const timeDiff = executeAtUTC.getTime() - nowUTC.getTime(); // difference in milliseconds
            const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // convert to days, round up
            await sendReminderEmail(
              order.seller_details.email,
              shipment.order_id,
              shipment.reminderSent,
              daysLeft,
              order.seller_details.name,
              {
                title: order.artwork_data.title,
                artist: order.artwork_data.artist,
                art_id: order.artwork_data.art_id,
              },
              order.buyer_details.name,
              order.shipping_details.addresses.origin,
              order.seller_details.name,
              order.artwork_data.url,
              order.artwork_data.pricing.usd_price,
              order.createdAt,
              order.shipping_details.shipment_information.planned_shipping_date
            );
            return;
          }

          // Check if it's time to trigger the shipment workflow
          if (nowUTC >= executeAtUTC) {
            await updateShipmentStatus(shipment.order_id, "resolved");
            await triggerShipmentWorkflow(shipment.order_id);
            // Optionally delete from scheduled collection if it's a one-time operation
            // await ScheduledShipment.deleteOne({ order_id: shipment.order_id });
          }
        })
      );
    }

    console.log("✅ Scheduled shipment batch check completed.");
    return NextResponse.json(
      {
        message: "Scheduled shipment batch check completed.",
        shipmentsCreated: shipments.length,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorResponse = handleErrorEdgeCases(error);

    createErrorRollbarReport(
      "Cron: Create shipment at exhibition end date",
      error,
      errorResponse?.status
    );
    return NextResponse.json(
      { message: errorResponse?.message },
      { status: errorResponse?.status }
    );
  }
});
