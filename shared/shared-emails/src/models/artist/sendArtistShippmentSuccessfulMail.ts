import { sendMailVerification } from "../../controller/emailController";
import SendArtistShipmentSuccess from "../../views/shipment/SendArtistShipmentSuccess";

type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  artworkPrice: number;
};
export const sendArtistShippmentSuccessfulMail = async ({
  name,
  email,
  trackingCode,
  artwork,
  artworkImage,
  artistName,
  artworkPrice,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "orders",
    to: email,
    subject: "Funds are available for withdrawal!",
    react: SendArtistShipmentSuccess({
      trackingCode,
      name,
      artwork,
      artworkImage,
      artistName,
      price: artworkPrice.toString(),
    }),
  });
};
