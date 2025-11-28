import { toUTCDate } from "@omenai/shared-utils/src/toUtcDate";
import { serve } from "@upstash/workflow/nextjs";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import {
  buildShipmentData,
  getMongoClient,
  handleWaybillUpload,
  handleWorkflowError,
  sendShipmentEmailWorkflow,
  SHIPMENT_API_URL,
} from "../utils";
import {
  NotFoundError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { WaybillCache } from "@omenai/shared-models/models/orders/OrderWaybillCache";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { ScheduledShipment } from "@omenai/shared-models/models/orders/CreateShipmentSchedule";
import { tracking_url } from "@omenai/url-config/src/config";
import { sendShipmentScheduledEmail } from "@omenai/shared-emails/src/models/shipment/sendShipmentScheduledEmail";
import { createErrorRollbarReport } from "../../../util";

type Payload = {
  order_id: string;
};

// Utility function to handle shipment API call with timeout
async function callShipmentAPI(data: any): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

  try {
    const response = await fetch(SHIPMENT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://omenai.app",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const result = await response.json();

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new ServerError(
        errorResponse.message || "Shipment creation failed"
      );
    }

    return result;
  } catch (error) {
    clearTimeout(timeout);
    throw new ServerError("Shipment API request timed out");
  }
}

// Utility function to handle waybill upload and order update
async function processWaybill(
  waybillBase64: string,
  orderId: string
): Promise<void> {
  await handleWaybillUpload(waybillBase64, orderId);
  await WaybillCache.deleteOne({ order_id: orderId });
  await FailedJob.deleteOne({ jobId: orderId, jobType: "create_shipment" });
}

export const { POST } = serve<Payload>(async (ctx) => {
  const payload = ctx.requestPayload;

  return await ctx.run("create_shipment", async () => {
    const client = await getMongoClient();

    try {
      // Fetch the order
      const order = (await CreateOrder.findOne({
        order_id: payload.order_id,
      })) as CreateOrderModelTypes & { createdAt: string; updatedAt: string };

      if (!order) {
        throw new NotFoundError(
          `Order with order_id: ${payload.order_id} not found`
        );
      }

      // Remove any existing locks
      await LockMechanism.deleteOne({
        user_id: order.buyer_details.id,
        art_id: order.artwork_data.art_id,
      });

      const existingTrackingId =
        order.shipping_details.shipment_information.tracking.id;
      const existingWaybill =
        order.shipping_details.shipment_information.waybill_document;

      // Handle existing shipment
      if (existingTrackingId && existingWaybill) {
        console.log("Shipment already created, skipping shipment API call.");
        await FailedJob.deleteOne({
          jobId: payload.order_id,
          jobType: "create_shipment",
        });
        await WaybillCache.deleteOne({ order_id: payload.order_id });
        return true;
      }

      // Handle existing tracking ID but no waybill
      if (existingTrackingId && !existingWaybill) {
        const waybillCache = await WaybillCache.findOne(
          { order_id: payload.order_id },
          "pdf_base64"
        );

        if (!waybillCache) {
          throw new Error("No waybill cache data, please contact support");
        }

        await processWaybill(waybillCache.pdf_base64, payload.order_id);
        return true;
      }

      // Handle exhibition status
      if (
        order.exhibition_status !== null &&
        order.exhibition_status.exhibition_end_date &&
        order.exhibition_status.status === "pending"
      ) {
        const session = await client.startSession();
        session.startTransaction();
        try {
          await ScheduledShipment.updateOne(
            { order_id: order.order_id },
            {
              $set: {
                order_id: order.order_id,
                executeAt: toUTCDate(
                  order.exhibition_status.exhibition_end_date
                ),
              },
            },
            { upsert: true }
          ).session(session);

          await CreateOrder.updateOne(
            { order_id: order.order_id },
            { $set: { "exhibition_status.status": "scheduled" } }
          ).session(session);

          // TODO: Send email informing buyer and seller that shipment creation is scheduled for later
          await sendShipmentScheduledEmail({
            email: order.buyer_details.email,
            name: order.buyer_details.name,
            trackingCode: order.order_id,
            artwork: order.artwork_data.title,
          });

          await sendShipmentScheduledEmail({
            email: order.seller_details.email,
            name: order.seller_details.name,
            trackingCode: order.order_id,
            artwork: order.artwork_data.title,
          });

          session.commitTransaction();
          return true;
        } catch (error) {
          session.abortTransaction();
          createErrorRollbarReport(
            "Shipment creation workflow - Failed to abort MongoDB transaction",
            error,
            500
          );
          throw new Error("Transaction error, session was aborted");
        } finally {
          session.endSession();
        }
      }

      // Create a new shipment
      const shipmentData = buildShipmentData(order);
      const shipment = await callShipmentAPI(shipmentData);
      await ScheduledShipment.deleteOne({ order_id: order.order_id });

      // Save shipment details and waybill
      await WaybillCache.create({
        order_id: payload.order_id,
        pdf_base64: shipment.data.documents[0].content,
      });

      await CreateOrder.updateOne(
        { order_id: payload.order_id },
        {
          $set: {
            "shipping_details.shipment_information.tracking.id":
              shipment.data.shipmentTrackingNumber,
            "shipping_details.shipment_information.tracking.link": `${tracking_url()}?tracking_id=${shipment.data.shipmentTrackingNumber}`,
            "shipping_details.shipment_information.estimates":
              shipment.data.estimatedDeliveryDate,
            "shipping_details.shipment_information.planned_shipping_date":
              shipment.data.plannedShippingDateAndTime,
            "shipping_details.shipment_information.tracking.delivery_status":
              "In Transit",
          },
        }
      );

      await sendShipmentEmailWorkflow(
        shipmentData.receiver_data.fullname,
        shipmentData.receiver_data.email,
        shipmentData.seller_details.fullname,
        shipmentData.seller_details.email,
        shipment.data.shipmentTrackingNumber,
        shipment.data.documents[0].content
      );

      await processWaybill(
        shipment.data.documents[0].content,
        payload.order_id
      );

      return true;
    } catch (error: any) {
      createErrorRollbarReport(
        "Shipment creation workflow - workflow error",
        error,
        500
      );
      await handleWorkflowError(error, payload);
    }
  });
});
