import { sendMailVerification } from "../../controller/emailController";
import SubscriptionPaymentSuccessfulMail from "../../views/subscription/SubscriptionPaymentSuccessfulMail";

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
    prefix: "Omenai subscriptions",
    from: "transactions",
    to: email,
    subject: "Confirmation: Successful Subscription Payment",
    react: SubscriptionPaymentSuccessfulMail(name),
  });
};
