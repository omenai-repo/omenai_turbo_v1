import { sendMailVerification } from "../../controller/emailController";
import PaymentSuccessfulGalleryMail from "../../views/payment/PaymentSuccessGalleryMail";
import PaymentSuccessMailArtist from "../../views/payment/PaymentSuccessMailForArtist";

type EmailData = {
  email: string;
  name: string;
  artwork: string;
  price: string;
  order_date: string;
  order_id: string;
  transaction_id: string;
  artistName: string;
  artworkImage: string;
};
export const sendPaymentSuccessMailArtist = async ({
  email,
  name,
  artwork,
  price,
  order_date,
  order_id,
  transaction_id,
  artistName,
  artworkImage,
}: EmailData) => {
  // Set up resend here instead
  const { data, error } = await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "transactions",
    to: email,
    subject: "Successful Payment for Your Artwork",
    react: PaymentSuccessMailArtist({
      name,
      artwork,
      amount: price,
      transaction_id,
      order_date,
      order_id,
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
