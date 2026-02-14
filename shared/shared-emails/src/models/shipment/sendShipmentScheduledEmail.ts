import { sendMailVerification } from "../../controller/emailController";
import SendShipmentScheduled from "../../views/shipment/SendShipmentScheduled";
type EmailData = {
  name: string;
  artworkId: string;
  email: string;
  artwork: string;
  artworkImage: string;
  artistname: string;
  price: string;
};
export const sendShipmentScheduledEmail = async ({
  name,
  artworkId,
  email,
  artwork,
  artworkImage,
  artistname,
  price,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Shipment created - Prepare for pickup",
    react: SendShipmentScheduled(
      name,
      artworkId,
      artwork,
      artworkImage,
      artistname,
      price
    ),
  });
};
