import { sendMailVerification } from "../../controller/emailController";
import PaymentSuccessfulMail, {
  PurchaseConfirmationEmail,
} from "../../views/payment/PaymentSuccessMail";

type EmailData = {
  email: string;
  name: string;
  artwork: string;
  price: string;
  order_id: string;
  order_date: string;
  transactionId: string;
};
export const sendPaymentSuccessMail = async ({
  email,
  name,
  artwork,
  price,
  order_id,
  order_date,
  transactionId,
}: EmailData) => {
  // Set up resend here instead
  const { data, error } = await sendMailVerification({
    prefix: "Omenai orders",
    from: "transactions",
    to: email,
    subject: "Confirmation: Successful Order Payment",
    react: PurchaseConfirmationEmail({
      name,
      artwork,
      amount: price,
      order_id,
      date: order_date,
      transactionId,
    }),
  });

  if (error)
    return {
      error: true,
      message: "Error sending email",
    };
  else {
    return {
      error: false,
      message: "Email sent successfully",
    };
  }
};
