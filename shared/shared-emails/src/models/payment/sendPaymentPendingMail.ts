import { sendMailVerification } from "../../controller/emailController.ts";
import PaymentPendingMail from "../../views/payment/PaymentPendingMail.tsx";

type EmailData = {
  email: string;
  name: string;
  artwork: string;
};
export const sendPaymentPendingMail = async ({
  email,
  name,
  artwork,
}: EmailData) => {
  // Set up resend here instead
  await sendMailVerification({
    prefix: "Orders",
    from: "transactions",
    to: email,
    subject: "Your Payment is being Processed",
    react: PaymentPendingMail(name, artwork),
  });
};
