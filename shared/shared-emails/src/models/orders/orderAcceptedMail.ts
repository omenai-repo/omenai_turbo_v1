import { sendMailVerification } from "../../controller/emailController";
import OrderAcceptedEmail from "../../views/order/OrderAcceptedEmail";

type EmailData = {
  name: string;
  email: string;
  order_id: string;
  user_id: string;
  artwork_data: any;
};
export const sendOrderAcceptedMail = async ({
  name,
  email,
  order_id,
  user_id,
  artwork_data,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "transactions",
    to: email,
    subject: "Your Order has been Accepted!",
    react: OrderAcceptedEmail({
      name,
      orderId: order_id,
      userId: user_id,
      artwork: artwork_data,
    }),
  });
};
