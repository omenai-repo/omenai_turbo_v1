import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { sendSellerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendSellerShipmentEmail";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { serve } from "@upstash/workflow/nextjs";

type Payload = {
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  sellerEmail: string;
  trackingCode: string;
  fileContent: string;
  artwork: string;
  artworkImage: string;
  artworkPrice: number;
};
export const { POST } = serve<Payload>(async (ctx) => {
  const payload: Payload = ctx.requestPayload;
  await connectMongoDB();
  const artworkImage = getImageFileView(payload.artworkImage, 120);
  await Promise.all([
    ctx.run("sendSellerShipmentEmail", async () => {
      await sendSellerShipmentEmail({
        name: payload.sellerName,
        email: payload.sellerEmail,
        fileContent: payload.fileContent,
        artistName: payload.sellerName,
        artwork: payload.artwork,
        artworkImage,
        artworkPrice: payload.artworkPrice,
      });
    }),
    ctx.run("sendBuyerShipmentEmail", async () => {
      await sendBuyerShipmentEmail({
        name: payload.buyerName,
        email: payload.buyerEmail,
        trackingCode: payload.trackingCode,
        artistName: payload.sellerName,
        artwork: payload.artwork,
        artworkImage,
        artworkPrice: payload.artworkPrice,
      });
    }),
  ]);
});
