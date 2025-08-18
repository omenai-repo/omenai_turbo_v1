import { sendMailVerification } from "../../controller/emailController";
import OrderDeclinedWarning from "../../views/order/OrderDeclinedWarning";

type EmailData = {
  name: string;
  email: string | string[];
};
export const sendOrderDeclineWarning = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: [...email],
    subject: "Notice: Potential Order Request Decline",
    react: OrderDeclinedWarning({ name }),
  });
};
