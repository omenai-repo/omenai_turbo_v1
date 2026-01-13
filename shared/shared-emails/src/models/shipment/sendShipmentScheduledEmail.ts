import { sendMailVerification } from "../../controller/emailController";
import SendShipmentScheduled from "../../views/shipment/SendShipmentScheduled";
type EmailData = {
  name: string;
  email: string;
  artwork: string;
  artworkImage: string;
  buyerName: string;
  requestDate: string;
};
export const sendShipmentScheduledEmail = async ({
  name,
  email,
  artwork,
  artworkImage,
  buyerName,
  requestDate,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Shipment Creation Scheduled for Later",
    react: SendShipmentScheduled(
      name,
      artwork,
      artworkImage,
      buyerName,
      requestDate
    ),
  });
};
