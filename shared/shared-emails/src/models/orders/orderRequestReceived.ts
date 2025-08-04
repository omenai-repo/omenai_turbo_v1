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
    prefix: "Orders",
    from: "transactions",
    to: email,
    subject: "Acknowledgement of order request",
    react: OrderRequestReceivedEmail(name, artwork_data, orderId),
  });
};
