import { sendMailVerification } from "../../controller/emailController.ts";
import SubscriptionPaymentSuccessfulMail from "../../views/subscription/SubscriptionPaymentSuccessfulMail.tsx";

type EmailData = {
  name: string;
  email: string;
};
export const sendSubscriptionPaymentSuccessfulMail = async ({
  name,
  email,
}: EmailData) => {
  // Set up resend here instead
  await sendMailVerification({
    prefix: "Subscriptions",
    from: "transactions",
    to: email,
    subject: "Confirmation: Successful Subscription Payment",
    react: SubscriptionPaymentSuccessfulMail(name),
  });
};
