import { documentation_storage } from "@omenai/appwrite-config/appwrite";
import { saveFailedJob } from "@omenai/shared-lib/workflow_runs/createFailedWorkflowJobs";
import { ID, Payload } from "appwrite";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

export const uploadWaybillDocument = async (file: File) => {
  if (!file) return;
  const fileUploaded = await documentation_storage.createFile(
    process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
    ID.unique(),
    file
  );
  return fileUploaded;
};

export default uploadWaybillDocument;

export async function handleWorkflowError(
  error: any,
  session: any,
  payload: Payload
) {
  const error_response = handleErrorEdgeCases(error);
  await session.abortTransaction();
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
