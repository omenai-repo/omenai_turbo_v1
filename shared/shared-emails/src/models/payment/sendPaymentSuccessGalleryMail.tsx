import { sendMailVerification } from "../../controller/emailController";
import PaymentSuccessfulGalleryMail from "../../views/payment/PaymentSuccessGalleryMail";

type EmailData = {
  email: string;
  name: string;
  artwork: string;
  price: string;
  order_id: string;
  order_date: string;
  transaction_Id: string;
};
export const sendPaymentSuccessGalleryMail = async ({
  email,
  name,
  artwork,
  price,
  order_id,
  order_date,
  transaction_Id,
}: EmailData) => {
  // Set up resend here instead
  await sendMailVerification({
    prefix: "Orders",
    from: "transactions",
    to: email,
    subject: "Successful Payment for Your Artwork",
    react: PaymentSuccessfulGalleryMail(
      name,
      artwork,
      price,
      order_id,
      order_date,
      transaction_Id
    ),
  });
};
