// /api/workflows/createShipment.ts
import { serve } from "@upstash/workflow/nextjs";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { getApiUrl } from "@omenai/url-config/src/config";
import uploadWaybillDocument, {
  base64ToPDF,
  buildShipmentData,
  getMongoClient,
  handleWorkflowError,
} from "../resources";
import { documentation_storage } from "@omenai/appwrite-config";
import {
  generateAlphaDigit,
  generateDigit,
} from "@omenai/shared-utils/src/generateToken";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import {
  NotFoundError,
  ServerError,
} from "../../../../../custom/errors/dictionary/errorDictionary";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { LockMechanism } from "@omenai/shared-models/models/lock/LockSchema";
import { CreateOrderModelTypes } from "@omenai/shared-types";
type Payload = {
  order_id: string;
};

const APPWRITE_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!;

const SHIPMENT_API_URL = `${getApiUrl()}/api/shipment/create_shipment`;

export const { POST } = serve<Payload>(async (ctx) => {
  const payload = ctx.requestPayload;

  return await ctx.run("create_shipment", async () => {
    const client = await getMongoClient();
    const session = await client.startSession();
    session.startTransaction();
    try {
      const order:
        | (CreateOrderModelTypes & {
            createdAt: string;
            updatedAt: string;
          })
        | null = await CreateOrder.findOne({ order_id: payload.order_id });
      if (!order)
        throw new NotFoundError(
          `Order with order_id: ${payload.order_id} not found`
        );

      await LockMechanism.deleteOne({
        user_id: order.buyer_details.id,
        art_id: order.artwork_data.art_id,
      }).session(session);

      const data = buildShipmentData(order);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

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

      const shipmentJson = await shipmentResponse.json();
      if (!shipmentResponse.ok)
        throw new ServerError(
          shipmentJson.message || "Shipment creation failed"
        );

      const trackingCode = shipmentJson.data.shipmentTrackingNumber;
      const waybillDocBase64 = shipmentJson.data.documents[0].content;
      const waybillFile = base64ToPDF(
        waybillDocBase64,
        `waybilldoc_${generateAlphaDigit(6)}.pdf`
      );
      const uploadedDoc = await uploadWaybillDocument(waybillFile);

      if (!uploadedDoc)
        throw new ServerError("Waybill document upload failed on Appwrite");

      const waybillDocLink = documentation_storage.getFileView(
        APPWRITE_BUCKET_ID,
        uploadedDoc.$id
      );

      await CreateOrder.updateOne(
        { order_id: payload.order_id },
        {
          $set: {
            "shipping_details.shipment_information.waybill_document":
              waybillDocLink,
            "shipping_details.shipment_information.tracking.id": trackingCode,
            "shipping_details.shipment_information.tracking.link":
              "https://dashbard.omenai.app/orders",
          },
        }
      );

      await createWorkflow(
        "/api/workflows/emails/sendShipmentEmail",
        `email_workflow_${generateDigit(2)}`,
        JSON.stringify({
          buyerName: data.receiver_data.fullname,
          buyerEmail: data.receiver_data.email,
          sellerName: data.seller_details.fullname,
          sellerEmail: data.seller_details.email,
          trackingCode,
          fileContent: waybillDocBase64,
        })
      );

      await FailedJob.deleteOne({
        jobId: payload.order_id,
        jobType: "create_shipment",
      });

      session.commitTransaction();
      return true;
    } catch (error: any) {
      await handleWorkflowError(error, session, payload);
    } finally {
      session.endSession();
    }
  });
});
