import { storage } from "@omenai/appwrite-config/appwrite";
import { saveFailedJob } from "@omenai/shared-lib/workflow_runs/createFailedWorkflowJobs";
import { ID, Payload } from "appwrite";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export const SHIPMENT_API_URL = `${getApiUrl()}/api/shipment/create_shipment`;

export const uploadWaybillDocument = async (file: File) => {
  if (!file) throw new Error("WAYBILL DOC ERROR: No File was provided");
  try {
    console.log("This has begun running");
    const fileUploaded = await storage.createFile({
      bucketId: process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
      fileId: ID.unique(),
      file,
    });

    if (fileUploaded) return fileUploaded;
  } catch (error) {
    throw new Error("Appwrite Exception: Something went wrong on Appwrite");
  }
};

export default uploadWaybillDocument;

export async function handleWorkflowError(error: any, payload: Payload) {
  const error_response = handleErrorEdgeCases(error);
  await saveFailedJob({
    jobId: payload.order_id,
    jobType: "create_shipment",
    payload,
    reason: error_response.message,
  });
  throw new Error("RetryableError: " + error_response.message);
}

import { Buffer } from "buffer";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
import {
  generateAlphaDigit,
  generateDigit,
} from "@omenai/shared-utils/src/generateToken";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { WaybillCache } from "@omenai/shared-models/models/orders/OrderWaybillCache";

export const base64ToPDF = (
  base64: string,
  filename = "waybilldoc.pdf"
): File => {
  const byteArray = Buffer.from(base64, "base64");
  return new File([byteArray], filename, { type: "application/pdf" });
};

let mongoClient: any;

export async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = await connectMongoDB();
  }
  return mongoClient;
}

export function buildShipmentData(
  order: CreateOrderModelTypes & { createdAt: string; updatedAt: string }
) {
  return {
    specialInstructions: order.shipping_details.additional_information,
    artwork_name: order.artwork_data.title,
    seller_details: {
      address: order.shipping_details.addresses.origin,
      email: order.seller_details.email,
      phone: order.seller_details.phone,
      fullname: order.seller_details.name,
    },
    receiver_address: order.shipping_details.addresses.destination,
    shipment_product_code:
      order.shipping_details.shipment_information.shipment_product_code,
    dimensions: order.shipping_details.shipment_information.dimensions,
    receiver_data: {
      email: order.buyer_details.email,
      phone: order.buyer_details.phone,
      fullname: order.buyer_details.name,
    },
    invoice_number: order.order_id,
  };
}

// Utility function to upload waybill document and update the order
export async function handleWaybillUpload(
  waybillBase64: string,
  orderId: string
): Promise<string> {
  const waybillFile = base64ToPDF(
    waybillBase64,
    `waybilldoc_${generateAlphaDigit(6)}.pdf`
  );
  const uploadedDoc = await uploadWaybillDocument(waybillFile);

  if (!uploadedDoc) {
    throw new ServerError("Waybill document upload failed on Appwrite");
  }

  const waybillDocLink = storage.getFileView({
    bucketId: uploadedDoc.bucketId,
    fileId: uploadedDoc.$id,
  });

  const updateResult = await CreateOrder.updateOne(
    { order_id: orderId },
    {
      $set: {
        "shipping_details.shipment_information.waybill_document":
          waybillDocLink,
      },
    }
  );

  if (updateResult.modifiedCount === 0) {
    throw new Error("Unable to update order waybill document");
  }

  await WaybillCache.deleteOne({ order_id: orderId });
  return waybillDocLink;
}

// Utility function to create a workflow for sending shipment emails
export async function sendShipmentEmailWorkflow(
  buyerName: string,
  buyerEmail: string,
  sellerName: string,
  sellerEmail: string,
  trackingCode: string,
  fileContent: string,
  artwork: string,
  artworkImage: string,
  artworkPrice: number
) {
  await createWorkflow(
    "/api/workflows/emails/sendShipmentEmail",
    `email_workflow_${generateDigit(8)}`,
    JSON.stringify({
      buyerName,
      buyerEmail,
      sellerName,
      sellerEmail,
      trackingCode,
      fileContent,
      artwork,
      artworkImage,
      artworkPrice,
    })
  );
}
