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
import {
  CreateOrderModelTypes,
  ShipmentRequestDataTypes,
} from "@omenai/shared-types";
import { ScheduledShipment } from "@omenai/shared-models/models/orders/CreateShipmentSchedule";
import { tracking_url } from "@omenai/url-config/src/config";
import { sendShipmentScheduledEmail } from "@omenai/shared-emails/src/models/shipment/sendShipmentScheduledEmail";
import { createErrorRollbarReport } from "../../../util";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Payload = {
  order_id: string;
};

type OrderWithTimestamps = CreateOrderModelTypes & {
  createdAt: string;
  updatedAt: string;
};

type ShipmentAction =
  | "ALREADY_COMPLETED"
  | "RECOVER_WAYBILL"
  | "SCHEDULE_SHIPMENT"
  | "CREATE_SHIPMENT";

/* -------------------------------------------------------------------------- */
/*                             SHIPMENT API CALL                               */
/* -------------------------------------------------------------------------- */

async function callShipmentAPI(
  data: Omit<ShipmentRequestDataTypes, "originCountryCode">,
): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(SHIPMENT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new ServerError(result?.message || "Shipment creation failed");
    }

    return result;
  } catch {
    throw new ServerError("Shipment API request failed or timed out");
  } finally {
    clearTimeout(timeout);
  }
}

/* -------------------------------------------------------------------------- */
/*                               WAYBILL HELPERS                               */
/* -------------------------------------------------------------------------- */

async function finalizeWaybill(orderId: string, pdfBase64: string) {
  await handleWaybillUpload(pdfBase64, orderId);
  await WaybillCache.deleteOne({ order_id: orderId });
  await FailedJob.deleteOne({ jobId: orderId, jobType: "create_shipment" });
}

/* -------------------------------------------------------------------------- */
/*                             ORDER STATE HANDLERS                            */
/* -------------------------------------------------------------------------- */

async function cleanupLock(order: OrderWithTimestamps) {
  await LockMechanism.deleteOne({
    user_id: order.buyer_details.id,
    art_id: order.artwork_data.art_id,
  });
}

async function handleCompletedShipment(
  order: OrderWithTimestamps,
  orderId: string,
) {
  await FailedJob.deleteOne({ jobId: orderId, jobType: "create_shipment" });
  await WaybillCache.deleteOne({ order_id: orderId });
}

async function handleWaybillRecovery(orderId: string) {
  const cache = await WaybillCache.findOne({ order_id: orderId }, "pdf_base64");

  if (!cache) {
    throw new Error("Waybill missing. Contact support.");
  }

  await finalizeWaybill(orderId, cache.pdf_base64);
}

function resolveShipmentAction(order: OrderWithTimestamps): ShipmentAction {
  const trackingId = order.shipping_details.shipment_information.tracking.id;

  const waybill = order.shipping_details.shipment_information.waybill_document;

  if (trackingId && waybill) return "ALREADY_COMPLETED";
  if (trackingId && !waybill) return "RECOVER_WAYBILL";

  if (
    order.exhibition_status?.status === "pending" &&
    order.exhibition_status.exhibition_end_date
  ) {
    return "SCHEDULE_SHIPMENT";
  }

  return "CREATE_SHIPMENT";
}

async function executeShipmentAction(
  action: ShipmentAction,
  order: OrderWithTimestamps,
  orderId: string,
  client: any,
) {
  const actionMap: Record<ShipmentAction, () => Promise<void>> = {
    ALREADY_COMPLETED: async () => {
      await handleCompletedShipment(order, orderId);
    },

    RECOVER_WAYBILL: async () => {
      await handleWaybillRecovery(orderId);
    },

    SCHEDULE_SHIPMENT: async () => {
      await scheduleShipment(order, client);
    },

    CREATE_SHIPMENT: async () => {
      await createShipment(order, orderId);
    },
  };

  await actionMap[action]();
}

async function scheduleShipment(order: OrderWithTimestamps, client: any) {
  const session = await client.startSession();

  try {
    session.startTransaction();

    await ScheduledShipment.updateOne(
      { order_id: order.order_id },
      {
        $set: {
          order_id: order.order_id,
          executeAt: toUTCDate(order.exhibition_status!.exhibition_end_date),
        },
      },
      { upsert: true },
    ).session(session);

    await CreateOrder.updateOne(
      { order_id: order.order_id },
      { $set: { "exhibition_status.status": "scheduled" } },
    ).session(session);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }

  const artworkImage = getImageFileView(order.artwork_data.url, 120);

  await Promise.all([
    // sendShipmentScheduledEmail({
    //   email: order.buyer_details.email,
    //   name: order.buyer_details.name,
    //   artwork: order.artwork_data.title,
    //   artworkImage,
    //   buyerName: order.buyer_details.name,
    //   requestDate: order.createdAt,
    // }),
    sendShipmentScheduledEmail({
      email: order.seller_details.email,
      name: order.seller_details.name,
      artwork: order.artwork_data.title,
      artworkImage,
      artistname: order.artwork_data.artist,
      artworkId: order.artwork_data.art_id,
      price: formatPrice(order.artwork_data.pricing.usd_price),
    }),
  ]);
}

/* -------------------------------------------------------------------------- */
/*                            SHIPMENT CREATION FLOW                           */
/* -------------------------------------------------------------------------- */

async function createShipment(order: OrderWithTimestamps, orderId: string) {
  const shipmentData = buildShipmentData(order);
  const shipment = await callShipmentAPI(shipmentData);

  await ScheduledShipment.deleteOne({ order_id: order.order_id });

  await WaybillCache.updateOne(
    { order_id: orderId },
    { $setOnInsert: { pdf_base64: shipment.data.documents[0].content } },
    { upsert: true },
  );

  await CreateOrder.updateOne(
    { order_id: orderId },
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
    },
  );

  await sendShipmentEmailWorkflow(
    shipmentData.receiver_data.fullname,
    shipmentData.receiver_data.email,
    shipmentData.seller_details.fullname,
    shipmentData.seller_details.email,
    shipment.data.shipmentTrackingNumber,
    shipment.data.documents[0].content,
    shipmentData.artwork_name,
    order.artwork_data.url,
    order.artwork_data.pricing.usd_price,
    order.artwork_data.artist,
  );

  await finalizeWaybill(orderId, shipment.data.documents[0].content);
}

/* -------------------------------------------------------------------------- */
/*                                  WORKFLOW                                   */
/* -------------------------------------------------------------------------- */

export const { POST } = serve<Payload>(async (ctx) => {
  const { order_id } = ctx.requestPayload;

  return ctx.run("create_shipment", async () => {
    const client = await getMongoClient();

    try {
      const order = (await CreateOrder.findOne({
        order_id,
      })) as OrderWithTimestamps;

      if (!order) {
        throw new NotFoundError(`Order with order_id ${order_id} not found`);
      }

      await cleanupLock(order);

      const action = resolveShipmentAction(order);

      await executeShipmentAction(action, order, order_id, client);

      return true;
    } catch (error: any) {
      createErrorRollbarReport(
        "Shipment creation workflow — unexpected error",
        error,
        500,
      );

      return handleWorkflowError(error, { order_id });
    }
  });
});
