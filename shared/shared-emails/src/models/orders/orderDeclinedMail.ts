import { sendMailVerification } from "../../controller/emailController";
import OrderDeclinedEmail from "../../views/order/OrderDeclinedEmail";

type EmailData = {
  name: string;
  email: string;
  reason: string;
  artwork_data: any;
};
export const sendOrderDeclinedMail = async ({
  name,
  email,
  reason,
  artwork_data,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "transactions",
    to: email,
    subject: "Your Order has been Declined!",
    react: OrderDeclinedEmail({
      recipientName: name,
      declineReason: reason,
      artwork: artwork_data,
    }),
  });
};
