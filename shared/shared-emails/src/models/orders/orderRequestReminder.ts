import { sendMailVerification } from "../../controller/emailController.ts";
import OrderRequestReminder from "../../views/order/OrderRequessstReminder.tsx";

type EmailData = {
  name: string;
  email: string | string[];
};
export const sendOrderRequestReminder = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Orders",
    from: "orders",
    to: "omenai@omenai.app",
    bcc: [...email],
    subject: "Order Request reminder",
    react: OrderRequestReminder(name),
  });
};
