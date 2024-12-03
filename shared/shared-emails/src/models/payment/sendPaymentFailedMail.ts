import { sendMailVerification } from "../../controller/emailController.ts";
import PaymentFailedMail from "../../views/payment/PaymentFailedMail.tsx";

type EmailData = {
  email: string;
  name: string;
  artwork: string;
  order_id: string;
};
export const sendPaymentFailedMail = async ({
  email,
  name,
  artwork,
  order_id,
}: EmailData) => {
  // Set up resend here instead
  await sendMailVerification({
    prefix: "Orders",
    from: "transactions",
    to: email,
    subject: "We encountered an issue processing your payment",
    react: PaymentFailedMail(name, artwork, order_id),
  });
};
