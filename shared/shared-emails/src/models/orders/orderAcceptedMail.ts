import { sendMailVerification } from "../../controller/emailController";
import OrderAcceptedEmail from "../../views/order/OrderAcceptedEmail";

type EmailData = {
  name: string;
  email: string;
  paymentUrl: string;
  artworkUrl: string;
  artwork_data: any;
};
export const sendOrderAcceptedMail = async ({
  name,
  email,
  paymentUrl,
  artworkUrl,
  artwork_data,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "orders",
    to: email,
    subject: "Your Order has been Accepted!",
    react: OrderAcceptedEmail({
      name,
      paymentUrl,
      artworkUrl,
      artwork: artwork_data,
    }),
  });
};
