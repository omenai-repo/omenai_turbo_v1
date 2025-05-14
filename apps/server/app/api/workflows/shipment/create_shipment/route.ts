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

type Payload = {
  order_id: string;
};

export const { POST } = serve<Payload>(async (ctx) => {
  const payload = ctx.requestPayload;

  return await ctx.run("create_shipment", async () => {
    await getMongoClient();

    try {
      // Fetch the order
      const order:
        | (CreateOrderModelTypes & { createdAt: string; updatedAt: string })
        | null = await CreateOrder.findOne({
        order_id: payload.order_id,
      });

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

        await handleWaybillUpload(waybillCache.pdf_base64, payload.order_id);

        await WaybillCache.deleteOne({ order_id: payload.order_id });

        await FailedJob.deleteOne({
          jobId: payload.order_id,
          jobType: "create_shipment",
        });

        return true;
      }

      // Create a new shipment
      const data = buildShipmentData(order);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

      let shipmentResponse;
      try {
        const shipmentRes = await fetch(SHIPMENT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://omenai.app",
          },
          body: JSON.stringify(data),
        });
        shipmentResponse = shipmentRes;
        clearTimeout(timeout);
      } catch (error) {
        clearTimeout(timeout);
        throw new ServerError("Shipment API request timed out");
      }

      const shipment = await shipmentResponse.json();

      if (!shipmentResponse.ok) {
        throw new ServerError(shipment.message || "Shipment creation failed");
      }

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
            "shipping_details.shipment_information.tracking.link": `https://omenai.app/tracking/${payload.order_id}`,
            "shipping_details.shipment_information.estimates":
              shipment.data.estimatedDeliveryDate,
            "shipping_details.shipment_information.planned_shipping_date":
              shipment.data.plannedShippingDateAndTime,
          },
        }
      );
      await sendShipmentEmailWorkflow(
        data.receiver_data.fullname,
        data.receiver_data.email,
        data.seller_details.fullname,
        data.seller_details.email,
        shipment.data.shipmentTrackingNumber,
        shipment.data.documents[0].content
      );

      await handleWaybillUpload(
        shipment.data.documents[0].content,
        payload.order_id
      );

      return true;
    } catch (error: any) {
      await handleWorkflowError(error, payload);
    }
  });
});
