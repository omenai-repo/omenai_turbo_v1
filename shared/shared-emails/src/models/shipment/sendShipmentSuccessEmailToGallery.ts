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
};
export const sendGalleryShipmentSuccessEmail = async ({
  name,
  email,
  trackingCode,
  artwork,
  artworkImage,
  artistName,
  price,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "orders",
    to: email,
    subject: "Your Shipment Was Successfully Delivered.",
    react: SendGalleryShipmentSuccess({
      name,
      trackingCode,
      artwork,
      artworkImage,
      artistName,
      price,
    }),
  });
};
