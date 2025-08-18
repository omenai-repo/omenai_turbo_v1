import { sendMailVerification } from "../../controller/emailController";
import SubscriptionPaymentFailedMail from "../../views/subscription/SubscriptionPaymentFailedMail";

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
    prefix: "Omenai subscriptions",
    from: "transactions",
    to: email,
    subject: " Notification: Failed Subscription Payment Attempt",
    react: SubscriptionPaymentFailedMail(name),
  });
};
