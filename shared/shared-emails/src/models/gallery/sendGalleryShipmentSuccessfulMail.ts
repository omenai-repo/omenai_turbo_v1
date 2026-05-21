import { sendMailVerification } from "../../controller/emailController";
import SendGalleryShipmentSuccess from "../../views/shipment/SendGalleryShipmentSuccess";

type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
  orderUrl: string;
};
export const sendGalleryShipmentSuccessfulMail = async ({
  name,
  email,
  trackingCode,
  artwork,
  artworkImage,
  artistName,
  price,
  orderUrl,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "orders",
    to: email,
    subject: "Shipment Delivery Confirmed!",
    react: SendGalleryShipmentSuccess({
      name,
      trackingCode,
      artwork,
      artworkImage,
      artistName,
      price,
      orderUrl,
    }),
  });
};
