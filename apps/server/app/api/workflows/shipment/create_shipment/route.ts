import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { serve } from "@upstash/workflow/nextjs";
import { NextResponse } from "next/server";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { getApiUrl } from "@omenai/url-config/src/config";
import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { sendSellerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendSellerShipmentEmail";
import uploadWaybillDocument from "../resources";
import { documentation_storage } from "@omenai/appwrite-config";

const base64ToPDF = (base64: string, filename = "document.pdf"): File => {
  const byteCharacters = atob(base64);
  const byteNumbers = Array.from(byteCharacters).map((char) =>
    char.charCodeAt(0)
  );
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], filename, { type: "application/pdf" });
};

type Payload = {
  order_id: string;
};

export const { POST } = serve<Payload>(async (ctx) => {
  const payload: Payload = ctx.requestPayload;

  await connectMongoDB();
  const fetchOrder:
    | (CreateOrderModelTypes & { createedAt: string; updatedAt: string })
    | null = await CreateOrder.findOne({ order_id: payload.order_id });

  if (!fetchOrder) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const data = {
    specialInstructions: fetchOrder.shipping_details.additional_information,
    artwork_name: fetchOrder.artwork_data.title,
    seller_details: {
      address: fetchOrder.shipping_details.addresses.origin,
      email: fetchOrder.seller_details.email,
      phone: fetchOrder.seller_details.phone,
      fullname: fetchOrder.seller_details.name,
    },
    receiver_address: fetchOrder.shipping_details.addresses.destination,
    shipment_product_code:
      fetchOrder.shipping_details.shipment_information.shipment_product_code,
    dimensions: fetchOrder.shipping_details.shipment_information.dimensions,
    receiver_data: {
      email: fetchOrder.buyer_details.email,
      phone: fetchOrder.buyer_details.phone,
      fullname: fetchOrder.buyer_details.name,
    },
    invoice_number: fetchOrder.order_id,
  };

  const [create_shipment] = await Promise.all([
    ctx.run("create_new_shipment", async () => {
      const response = await fetch(
        `${getApiUrl()}/api/shipment/create_shipment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://omenai.app",
          },
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        return false;
      }

      const trackingCode = responseData.data.shipmentTrackingNumber;
      const waybillDocument = responseData.data.documents[0].content;
      const file: File = base64ToPDF(waybillDocument, "waybilldoc.pdf");

      const uploadDoc = await uploadWaybillDocument(file);
      let waybillDoc = "";
      if (uploadDoc) {
        const fileData = {
          bucketId: uploadDoc.bucketId,
          fileId: uploadDoc.$id,
        };

        const waybillFile = documentation_storage.getFileView(
          process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTATION_BUCKET_ID!,
          fileData.fileId
        );
        waybillDoc = waybillFile;
      } else {
        return NextResponse.json(
          { data: "Problem with document upload" },
          { status: 500 }
        );
      }

      if (waybillDoc === "") {
        return NextResponse.json(
          { data: "Problem with document upload" },
          { status: 500 }
        );
      }

      const updateOrder = await CreateOrder.updateOne(
        { order_id: payload.order_id },
        {
          $set: {
            "shipping_details.shipment_information.waybill_document":
              waybillDoc,
            "shipping_details.shipment_information.tracking.id": trackingCode,
            "shipping_details.shipment_information.tracking.link":
              "https://dashbard.omenai.app/orders",
          },
        }
      );

      if (updateOrder.modifiedCount === 0) {
        return NextResponse.json(
          { data: "Failed to update waybill document in DB" },
          { status: 500 }
        );
      }

      await sendSellerShipmentEmail({
        name: data.seller_details.fullname,
        email: data.seller_details.email,
        fileContent: waybillDocument,
      });

      await sendBuyerShipmentEmail({
        name: data.receiver_data.fullname,
        email: data.receiver_data.email,
        trackingCode,
      });

      return true;
    }),
  ]);

  if (create_shipment) {
    return NextResponse.json({ data: "Successful" }, { status: 201 });
  } else {
    return NextResponse.json(
      { data: "Failed to create shipment" },
      { status: 500 }
    );
  }
});
