import { sendMailVerification } from "../../controller/emailController";
import SendArtistShipmentSuccess from "../../views/shipment/SendArtistShipmentSuccess";
type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
};
export const SendArtistShipmentSuccessEmail = async ({
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
    subject: "Your Shipment Was Successfully Delivered.",
    react: SendArtistShipmentSuccess(
      trackingCode,
      name,
      artwork,
      artworkImage,
      artistName,
      price
    ),
  });
};
