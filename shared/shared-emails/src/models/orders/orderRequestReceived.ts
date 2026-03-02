import { sendMailVerification } from "../../controller/emailController";
import OrderRequestReceivedEmail from "../../views/order/OrderRequestRRecievedEmail";

type EmailData = {
  name: string;
  email: string;
  artwork_data: any;
  orderId: string;
};
export const sendOrderRequestReceivedMail = async ({
  name,
  email,
  artwork_data,
  orderId,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "transactions",
    to: email,
    subject: "We’ve received your request",
    react: OrderRequestReceivedEmail({ name, artwork: artwork_data, orderId }),
  });
};
