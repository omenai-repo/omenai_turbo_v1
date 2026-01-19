import { sendMailVerification } from "../../controller/emailController";
import BuyerShipmentEmail from "../../views/shipment/SendBuyerShipmentDetails";
type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  artworkPrice: string;
};
export const sendBuyerShipmentEmail = async ({
  name,
  email,
  trackingCode,
  artwork,
  artworkImage,
  artistName,
  artworkPrice,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Your shipment has been created and is ready for pickup",
    react: BuyerShipmentEmail(
      trackingCode,
      name,
      artwork,
      artworkImage,
      artistName,
      artworkPrice
    ),
  });
};
