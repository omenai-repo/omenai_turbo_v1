import { sendMailVerification } from "../../controller/emailController";
import BuyerShipmentEmail from "../../views/shipment/SendBuyerShipmentDetails";
type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
};
export const sendBuyerShipmentEmail = async ({
  name,
  email,
  trackingCode,
  artwork,
  artworkImage,
  artistName,
  price,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Your artwork is on it's way.",
    react: BuyerShipmentEmail({
      trackingCode,
      name,
      artwork,
      artworkImage,
      artistName,
      price,
    }),
  });
};
