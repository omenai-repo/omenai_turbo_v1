import { sendMailVerification } from "../../controller/emailController";
import OrderDeclinedEmail from "../../views/order/OrderDeclinedEmail";

type EmailData = {
  name: string;
  email: string;
  reason: string;
  artworkUrl: string;
  catalogUrl: string;
  artwork_data: any;
};
export const sendOrderDeclinedMail = async ({
  name,
  email,
  reason,
  artworkUrl,
  catalogUrl,
  artwork_data,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "orders",
    to: email,
    subject: "Your Order has been Declined!",
    react: OrderDeclinedEmail({
      recipientName: name,
      declineReason: reason,
      artwork: artwork_data,
      artworkUrl,
      catalogUrl,
    }),
  });
};
