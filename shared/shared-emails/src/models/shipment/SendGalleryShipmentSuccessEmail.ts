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
export const SendGalleryShipmentSuccessEmail = async ({
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
