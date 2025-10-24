import { sendMailVerification } from "../../controller/emailController";
import SendGalleryShipmentSuccess from "../../views/shipment/SendGalleryShipmentSuccess";

type EmailData = {
  name: string;
  email: string;
};
export const sendGalleryShipmentSuccessfulMail = async ({
  name,
  email,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai shippment",
    from: "transactions",
    to: email,
    subject: "Shipment Delivery Confirmed!",
    react: SendGalleryShipmentSuccess(name),
  });
};
