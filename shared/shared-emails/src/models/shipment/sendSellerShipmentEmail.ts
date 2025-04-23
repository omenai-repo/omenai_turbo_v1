import { sendMailVerification } from "../../controller/emailController";
import SellerShipmentEmail from "../../views/shipment/SendSellerShipmentDetails";
type EmailData = {
  name: string;
  email: string;
  fileContent: string;
};
export const sendSellerShipmentEmail = async ({
  name,
  email,
  fileContent,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Orders",
    from: "orders",
    to: email,
    subject: "Your shipment has been created and is ready for pickup",
    react: SellerShipmentEmail(name),
    attachments: [
      {
        filename: "waybill.pdf",
        content: fileContent,
      },
    ],
  });
};
