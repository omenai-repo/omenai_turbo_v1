import { sendMailVerification } from "../../controller/emailController";
import SendBuyerShipmentSuccess from "../../views/shipment/SendBuyerShipmentSuccess";
type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
  artworkImage: string;
  buyerName: string;
  requestDate: string;
};
export const SendBuyerShipmentSuccessEmail = async ({
  name,
  email,
  trackingCode,
  artwork,
  artworkImage,
  buyerName,
  requestDate,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Your Shipment Was Successfully Delivered.",
    react: SendBuyerShipmentSuccess(
      trackingCode,
      name,
      artwork,
      artworkImage,
      buyerName,
      requestDate
    ),
  });
};
