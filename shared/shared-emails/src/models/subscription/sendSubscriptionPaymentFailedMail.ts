import { sendMailVerification } from "../../controller/emailController.ts";
import SubscriptionPaymentFailedMail from "../../views/subscription/SubscriptionPaymentFailedMail.tsx";

type EmailData = {
  name: string;
  email: string;
};
export const sendSubscriptionPaymentFailedMail = async ({
  name,
  email,
}: EmailData) => {
  // Set up resend here instead
  await sendMailVerification({
    prefix: "Subscriptions",
    from: "transactions",
    to: email,
    subject: " Notification: Failed Subscription Payment Attempt",
    react: SubscriptionPaymentFailedMail(name),
  });
};
