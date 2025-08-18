import { sendMailVerification } from "../../controller/emailController";
import OrderAutoDeclined from "../../views/order/OrderAutoDeclined";

type EmailData = {
  name: string;
  email: string;
  artwork_data: any;
};
export const sendOrderAutoDeclinedMail = async ({
  name,
  email,
  artwork_data,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "transactions",
    to: email,
    subject: "Order auto declined",
    react: OrderAutoDeclined({ name, artwork: artwork_data }),
  });
};
