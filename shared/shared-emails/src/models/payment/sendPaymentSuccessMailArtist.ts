import { sendMailVerification } from "../../controller/emailController";
import PaymentSuccessfulGalleryMail from "../../views/payment/PaymentSuccessGalleryMail";
import PaymentSuccessMailArtist from "../../views/payment/PaymentSuccessMailForArtist";

type EmailData = {
  email: string;
  name: string;
  artwork: string;
  price: string;
  order_date: string;
  transactionId: string;
};
export const sendPaymentSuccessMailArtist = async ({
  email,
  name,
  artwork,
  price,
  order_date,
  transactionId,
}: EmailData) => {
  // Set up resend here instead
  const { data, error } = await sendMailVerification({
    prefix: "Omenai orders",
    from: "transactions",
    to: email,
    subject: "Successful Payment for Your Artwork",
    react: PaymentSuccessMailArtist({
      name,
      artwork,
      amount: price,
      transactionId,
      date: order_date,
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
