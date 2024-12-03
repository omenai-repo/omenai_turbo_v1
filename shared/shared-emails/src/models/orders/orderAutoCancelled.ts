import { sendMailVerification } from "../../controller/emailController.ts";
import OrderAutoDeclined from "../../views/order/OrderAutoDeclined.tsx";

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
    prefix: "Orders",
    from: "transactions",
    to: email,
    subject: "Order auto declined",
    react: OrderAutoDeclined(name, artwork_data),
  });
};
