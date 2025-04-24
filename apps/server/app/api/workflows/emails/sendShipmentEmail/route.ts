import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { sendSellerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendSellerShipmentEmail";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { TestCollection } from "@omenai/shared-models/models/test/TestSchema";
import { serve } from "@upstash/workflow/nextjs";
import { NextResponse } from "next/server";

type Payload = {
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  sellerEmail: string;
  trackingCode: string;
  fileContent: string;
};
export const { POST } = serve<Payload>(async (ctx) => {
  const payload: Payload = ctx.requestPayload;
  await connectMongoDB();
  await Promise.all([
    ctx.run("sendSellerShipmentEmail", async () => {
      await sendSellerShipmentEmail({
        name: payload.sellerName,
        email: payload.sellerEmail,
        fileContent: payload.fileContent,
      });
    }),
    ctx.run("sendBuyerShipmentEmail", async () => {
      await sendBuyerShipmentEmail({
        name: payload.buyerName,
        email: payload.buyerEmail,
        trackingCode: payload.trackingCode,
      });
    }),
  ]);
});
