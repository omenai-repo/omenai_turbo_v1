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
  transaction_id: string;
  artistName: string;
  artworkImage: string;
};
export const sendPaymentSuccessMail = async ({
  email,
  name,
  artwork,
  price,
  order_id,
  order_date,
  transaction_id,
  artistName,
  artworkImage,
}: EmailData) => {
  // Set up resend here instead
  const { data, error } = await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "transactions",
    to: email,
    subject: "Payment Confirmed. Thank you for your purchase",
    react: PurchaseConfirmationEmail({
      name,
      artwork,
      amount: price,
      order_id,
      order_date,
      transaction_id,
      artistName,
      artworkImage,
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
