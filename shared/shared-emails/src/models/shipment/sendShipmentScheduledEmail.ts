import { sendMailVerification } from "../../controller/emailController";
import BuyerShipmentEmail from "../../views/shipment/SendBuyerShipmentDetails";
import SendShipmentScheduled from "../../views/shipment/SendShipmentScheduled";
type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
  artwork: string;
};
export const sendShipmentScheduledEmail = async ({
  name,
  email,
  trackingCode,
  artwork,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Shipment Creation Scheduled for Later",
    react: SendShipmentScheduled(trackingCode, name, artwork),
  });
};
