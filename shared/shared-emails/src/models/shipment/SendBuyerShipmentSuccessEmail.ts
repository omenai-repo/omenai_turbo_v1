import { sendMailVerification } from "../../controller/emailController";
import SendBuyerShipmentSuccess from "../../views/shipment/SendBuyerShipmentSuccess";
type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
};
export const SendBuyerShipmentSuccessEmail = async ({
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
    subject: "Artwork Delivered Successfully!",
    react: SendBuyerShipmentSuccess(
      trackingCode,
      name,
      artwork,
      artworkImage,
      artistName,
      price,
    ),
  });
};
