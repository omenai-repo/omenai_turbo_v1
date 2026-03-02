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
  externalTrackingCode: string;
  courier: string;
};
export const sendBuyerShipmentEmail = async ({
  name,
  email,
  trackingCode,
  artwork,
  artworkImage,
  artistName,
  price,
  externalTrackingCode,
  courier,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
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
      externalTrackingCode,
      courier,
    }),
  });
};
