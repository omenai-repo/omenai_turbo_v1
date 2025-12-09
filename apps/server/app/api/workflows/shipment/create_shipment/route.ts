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
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

type Payload = {
  order_id: string;
};

/* -------------------------------------------------------------------------- */
/*                     SHIPMENT API WITH TIMEOUT HANDLING                     */
/* -------------------------------------------------------------------------- */

async function callShipmentAPI(data: any): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

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
      throw new ServerError(result?.message || "Shipment creation failed");
    }

    return result;
  } catch (err) {
    clearTimeout(timeout);
    throw new ServerError("Shipment API request failed or timed out");
  }
}

/* -------------------------------------------------------------------------- */
/*                           WAYBILL PROCESSING HELPERS                       */
/* -------------------------------------------------------------------------- */

async function processWaybill(
  waybillBase64: string,
  orderId: string
): Promise<void> {
  await handleWaybillUpload(waybillBase64, orderId);
  await WaybillCache.deleteOne({ order_id: orderId });
  await FailedJob.deleteOne({ jobId: orderId, jobType: "create_shipment" });
}

/* -------------------------------------------------------------------------- */
/*                                MAIN WORKFLOW                               */
/* -------------------------------------------------------------------------- */

export const { POST } = serve<Payload>(async (ctx) => {
  const payload = ctx.requestPayload;

  return await ctx.run("create_shipment", async () => {
    const client = await getMongoClient();

    try {
      /* -------------------------------------------------------------------------- */
      /*                                FETCH ORDER                                 */
      /* -------------------------------------------------------------------------- */

      const order = (await CreateOrder.findOne({
        order_id: payload.order_id,
      })) as CreateOrderModelTypes & { createdAt: string; updatedAt: string };

      if (!order) {
        throw new NotFoundError(
          `Order with order_id ${payload.order_id} not found`
        );
      }

      /* -------------------------------------------------------------------------- */
      /*                        REMOVE LOCK (IF IT EXISTS)                          */
      /* -------------------------------------------------------------------------- */

      await LockMechanism.deleteOne({
        user_id: order.buyer_details.id,
        art_id: order.artwork_data.art_id,
      });

      const existingTrackingId =
        order.shipping_details.shipment_information.tracking.id;
      const existingWaybill =
        order.shipping_details.shipment_information.waybill_document;

      /* -------------------------------------------------------------------------- */
      /*                      SHIPMENT ALREADY FULLY CREATED                        */
      /* -------------------------------------------------------------------------- */

      if (existingTrackingId && existingWaybill) {
        await FailedJob.deleteOne({
          jobId: payload.order_id,
          jobType: "create_shipment",
        });
        await WaybillCache.deleteOne({ order_id: payload.order_id });
        return true;
      }

      /* -------------------------------------------------------------------------- */
      /*                         TRACKING EXISTS BUT NO WAYBILL                     */
      /* -------------------------------------------------------------------------- */

      if (existingTrackingId && !existingWaybill) {
        const waybillCache = await WaybillCache.findOne(
          { order_id: payload.order_id },
          "pdf_base64"
        );

        if (!waybillCache) {
          throw new Error("Waybill missing. Contact support.");
        }

        await processWaybill(waybillCache.pdf_base64, payload.order_id);
        return true;
      }

      /* -------------------------------------------------------------------------- */
      /*                     EXHIBITION ACTIVE — SCHEDULE SHIPMENT                   */
      /* -------------------------------------------------------------------------- */

      if (
        order.exhibition_status !== null &&
        order.exhibition_status.exhibition_end_date &&
        order.exhibition_status.status === "pending"
      ) {
        const session = await client.startSession();
        let shouldSendEmails = false;

        try {
          session.startTransaction();

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

          await session.commitTransaction();
          shouldSendEmails = true;
        } catch (err) {
          try {
            await session.abortTransaction();
          } catch (abortErr) {
            createErrorRollbarReport(
              "Shipment workflow — Failed to abort MongoDB transaction",
              abortErr,
              500
            );
          }
          await session.endSession();
          throw err;
        } finally {
          await session.endSession();
        }

        const artworkImage = getImageFileView(order.artwork_data.url, 120);

        // Send emails **after** successful commit
        if (shouldSendEmails) {
          await sendShipmentScheduledEmail({
            email: order.buyer_details.email,
            name: order.buyer_details.name,
            trackingCode: order.order_id,
            artwork: order.artwork_data.title,
            artistName: order.seller_details.name,
            artworkImage,
            artworkPrice: order.artwork_data.pricing.usd_price,
          });

          await sendShipmentScheduledEmail({
            email: order.seller_details.email,
            name: order.seller_details.name,
            trackingCode: order.order_id,
            artwork: order.artwork_data.title,
            artistName: order.seller_details.name,
            artworkImage,
            artworkPrice: order.artwork_data.pricing.usd_price,
          });
        }

        return true;
      }

      /* -------------------------------------------------------------------------- */
      /*                              CREATE SHIPMENT                               */
      /* -------------------------------------------------------------------------- */

      const shipmentData = buildShipmentData(order);
      const shipment = await callShipmentAPI(shipmentData);

      await ScheduledShipment.deleteOne({ order_id: order.order_id });

      // Cache waybill temporarily
      await WaybillCache.create({
        order_id: payload.order_id,
        pdf_base64: shipment.data.documents[0].content,
      });

      // Save shipment details
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

      // Send shipment email & upload waybill
      await sendShipmentEmailWorkflow(
        shipmentData.receiver_data.fullname,
        shipmentData.receiver_data.email,
        shipmentData.seller_details.fullname,
        shipmentData.seller_details.email,
        shipment.data.shipmentTrackingNumber,
        shipment.data.documents[0].content,
        shipmentData.artwork_name,
        order.artwork_data.url,
        order.artwork_data.pricing.usd_price
      );

      await processWaybill(
        shipment.data.documents[0].content,
        payload.order_id
      );

      return true;
    } catch (error: any) {
      createErrorRollbarReport(
        "Shipment creation workflow — unexpected error",
        error,
        500
      );

      return await handleWorkflowError(error, payload);
    }
  });
});
