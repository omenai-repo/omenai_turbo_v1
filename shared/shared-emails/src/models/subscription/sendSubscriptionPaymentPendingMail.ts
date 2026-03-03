import { sendMailVerification } from "../../controller/emailController";
import SubscriptionPaymentPendingEmail from "../../views/subscription/SubscriptionPaymentPendingMail";

type EmailData = {
  name: string;
  email: string;
};
export const sendSubscriptionPaymentPendingMail = async ({
  name,
  email,
}: EmailData) => {
  // Set up resend here instead
  await sendMailVerification({
    prefix: "Omenai subscriptions",
    from: "orders",
    to: email,
    subject: "Notification: Pending Subscription Payment",
    react: SubscriptionPaymentPendingEmail({ name }),
  });
};
