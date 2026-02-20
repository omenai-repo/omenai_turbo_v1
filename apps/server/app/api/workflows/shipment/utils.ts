import { serverStorage } from "@omenai/appwrite-config/appwrite";
import { saveFailedJob } from "@omenai/shared-lib/workflow_runs/createFailedWorkflowJobs";
import { ID, Payload } from "appwrite";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";
import { Buffer } from "buffer";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import {
  CreateOrderModelTypes,
  ShipmentRequestDataTypes,
} from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
import {
  generateAlphaDigit,
  generateDigit,
} from "@omenai/shared-utils/src/generateToken";
import { ServerError } from "../../../../custom/errors/dictionary/errorDictionary";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { WaybillCache } from "@omenai/shared-models/models/orders/OrderWaybillCache";

export const SHIPMENT_API_URL = `${getApiUrl()}/api/shipment/create_shipment`;
// NEW: Define UPS URL
export const UPS_SHIPMENT_API_URL = `${getApiUrl()}/api/shipment/create_ups_shipment`;

export const uploadWaybillDocument = async (file: File) => {
  if (!file) throw new Error("WAYBILL DOC ERROR: No File was provided");
  try {
    const fileUploaded = await serverStorage.createFile({
      bucketId: process.env.APPWRITE_DOCUMENTATION_BUCKET_ID!,
      fileId: ID.unique(),
      file,
    });

    if (fileUploaded) return fileUploaded;
  } catch (error) {
    throw new Error("Appwrite Exception: Something went wrong on Appwrite");
  }
};

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

export const base64ToFile = (
  base64: string,
  filenamePrefix = "waybilldoc",
): File => {
  const byteArray = Buffer.from(base64, "base64");

  // Default to PDF
  let type = "application/pdf";
  let extension = "pdf";

  if (base64.startsWith("R0lGOD")) {
    type = "image/gif";
    extension = "gif";
  } else if (base64.startsWith("JVBERi")) {
    type = "application/pdf";
    extension = "pdf";
  }

  const filename = `${filenamePrefix}.${extension}`;

  return new File([byteArray], filename, { type });
};

let mongoClient: any;

export async function getMongoClient() {
  if (!mongoClient) {
    mongoClient = await connectMongoDB();
  }
  return mongoClient;
}

export async function handleWaybillUpload(
  waybillBase64: string,
  orderId: string,
): Promise<string> {
  const waybillFile = base64ToFile(
    waybillBase64,
    `waybilldoc_${generateAlphaDigit(6)}`,
  );

  const uploadedDoc = await uploadWaybillDocument(waybillFile);

  if (!uploadedDoc) {
    throw new ServerError("Waybill document upload failed on Appwrite");
  }

  const endpoint =
    process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = process.env.APPWRITE_CLIENT_ID!;
  const bucketId = process.env.APPWRITE_DOCUMENTATION_BUCKET_ID!;
  const fileId = uploadedDoc.$id;

  // Construct the raw URL string

  const waybillDocLink = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}&mode=admin`;

  const updateResult = await CreateOrder.updateOne(
    { order_id: orderId },
    {
      $set: {
        "shipping_details.shipment_information.waybill_document":
          waybillDocLink,
      },
    },
  );

  if (updateResult.modifiedCount === 0) {
    throw new Error("Unable to update order waybill document");
  }

  await WaybillCache.deleteOne({ order_id: orderId });
  return waybillDocLink;
}

// UPDATE: Added carrier to return type
export function buildShipmentData(
  order: CreateOrderModelTypes & { createdAt: string; updatedAt: string },
): Omit<ShipmentRequestDataTypes, "originCountryCode"> & { carrier: string } {
  return {
    specialInstructions:
      order.shipping_details.additional_information ??
      "Please contact me to confirm availability",
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
    invoice_number: `OMENAI-INV-${order.order_id}`,
    artwork_price: Number(order.artwork_data.pricing.usd_price),
    carrier: order.shipping_details.shipment_information.carrier,
  };
}

export async function sendShipmentEmailWorkflow(
  buyerName: string,
  buyerEmail: string,
  sellerName: string,
  sellerEmail: string,
  trackingCode: string,
  fileContent: string,
  artwork: string,
  artworkImage: string,
  artworkPrice: number,
  artistName: string,
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
      artistName,
    }),
  );
}
