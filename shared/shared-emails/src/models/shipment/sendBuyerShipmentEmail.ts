import { sendMailVerification } from "../../controller/emailController";
import BuyerShipmentEmail from "../../views/shipment/SendBuyerShipmentDetails";
type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
};
export const sendBuyerShipmentEmail = async ({
  name,
  email,
  trackingCode,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Orders",
    from: "orders",
    to: email,
    subject: "Your shipment has been created and is ready for pickup",
    react: BuyerShipmentEmail(trackingCode, name),
  });
};
