import { sendMailVerification } from "../../controller/emailController";
import SendGalleryShipmentSuccess from "../../views/shipment/SendGalleryShipmentSuccess";
type EmailData = {
  name: string;
  email: string;
  trackingCode: string;
};
export const SendGalleryShipmentSuccessEmail = async ({
  name,
  email,
  trackingCode,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Your Shipment Was Successfully Delivered.",
    react: SendGalleryShipmentSuccess(trackingCode, name),
  });
};
