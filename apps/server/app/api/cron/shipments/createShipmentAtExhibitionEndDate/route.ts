import { NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { ScheduledShipment } from "@omenai/shared-models/models/orders/CreateShipmentSchedule";
import { isWithinInterval, addDays } from "date-fns";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";
import { ServerError } from "../../../../../custom/errors/dictionary/errorDictionary";
import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";

// Utility function to send reminder emails
async function sendReminderEmail(
  orderId: string,
  isReminded: boolean
): Promise<void> {
  if (isReminded) {
    console.log(`🔁 Reminder already sent for order_id: ${orderId}, skipping.`);
    return;
  }
  console.log(`🟡 Sending reminder email for order_id: ${orderId}`);
  // TODO: Implement actual email sending logic here
  await ScheduledShipment.updateOne(
    { order_id: orderId },
    { $set: { reminderSent: true } }
  );
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

// Utility function to trigger shipment workflow
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

export async function GET() {
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
            await sendReminderEmail(shipment.order_id, shipment.reminderSent);
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
      { message: "Scheduled shipment batch check completed." },
      { status: 200 }
    );
  } catch (error) {
    const errorResponse = handleErrorEdgeCases(error);
    return NextResponse.json(
      { message: errorResponse?.message },
      { status: errorResponse?.status }
    );
  }
}
