import { sendMailVerification } from "../../controller/emailController";
import SendShipmentScheduled from "../../views/shipment/SendShipmentScheduled";
type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  artworkPrice: number;
};
export const sendShipmentScheduledEmail = async ({
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
    subject: "Shipment Creation Scheduled for Later",
    react: SendShipmentScheduled(
      trackingCode,
      name,
      artwork,
      artworkImage,
      artistName,
      artworkPrice
    ),
  });
};
