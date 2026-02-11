import { sendBuyerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendBuyerShipmentEmail";
import { sendSellerShipmentEmail } from "@omenai/shared-emails/src/models/shipment/sendSellerShipmentEmail";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
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
  artistName: string;
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
        artwork: payload.artwork,
        artworkImage: payload.artworkImage,
        artistName: payload.artistName,
        price: formatPrice(payload.artworkPrice),
      });
    }),
    ctx.run("sendBuyerShipmentEmail", async () => {
      await sendBuyerShipmentEmail({
        name: payload.buyerName,
        email: payload.buyerEmail,
        trackingCode: payload.trackingCode,
        artistName: payload.artistName,
        artwork: payload.artwork,
        artworkImage: payload.artworkImage,
        artworkPrice: formatPrice(payload.artworkPrice),
      });
    }),
  ]);
});
