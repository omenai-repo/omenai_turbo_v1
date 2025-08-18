import { sendMailVerification } from "../../controller/emailController";
import PaymentFailedMail from "../../views/payment/PaymentFailedMail";

type EmailData = {
  email: string;
  name: string;
  artwork: string;
};
export const sendPaymentFailedMail = async ({
  email,
  name,
  artwork,
}: EmailData) => {
  // Set up resend here instead
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "transactions",
    to: email,
    subject: "We encountered an issue processing your payment",
    react: PaymentFailedMail(name, artwork),
  });
};
