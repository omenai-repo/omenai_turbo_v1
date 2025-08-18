import { sendMailVerification } from "../../controller/emailController";
import OrderRequestReminder from "../../views/order/OrderRequessstReminder";

type EmailData = {
  name: string;
  email: string | string[];
};
export const sendOrderRequestReminder = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: "omenai@omenai.app",
    bcc: [...email],
    subject: "Order Request reminder",
    react: OrderRequestReminder(name),
  });
};
