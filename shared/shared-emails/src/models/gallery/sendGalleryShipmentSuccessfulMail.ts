import { sendMailVerification } from "../../controller/emailController";
import SendGalleryShipmentSuccess from "../../views/shipment/SendGalleryShipmentSuccess";

type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
  artworkImage: string;
  buyerName: string;
  requestDate: string;
};
export const sendGalleryShipmentSuccessfulMail = async ({
  name,
  email,
  trackingCode,
  artwork,
  artworkImage,
  buyerName,
  requestDate,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai shippment",
    from: "transactions",
    to: email,
    subject: "Shipment Delivery Confirmed!",
    react: SendGalleryShipmentSuccess(
      name,
      trackingCode,
      artwork,
      artworkImage,
      buyerName,
      requestDate
    ),
  });
};
