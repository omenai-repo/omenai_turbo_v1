import { sendMailVerification } from "../../controller/emailController.ts";
import OrderDeclinedEmail from "../../views/order/OrderDeclinedEmail.tsx";

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
    prefix: "Orders",
    from: "transactions",
    to: email,
    subject: "Your Order has been Declined!",
    react: OrderDeclinedEmail(name, reason, artwork_data),
  });
};
