import { sendMailVerification } from "../../controller/emailController";
import OrderAutoDeclined from "../../views/order/OrderAutoDeclined";

type EmailData = {
  name: string;
  email: string;
  artworkUrl: string;
  artwork_data: any;
};
export const sendOrderAutoDeclinedMail = async ({
  name,
  email,
  artworkUrl,
  artwork_data,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "orders",
    to: email,
    subject: "Order auto declined",
    react: OrderAutoDeclined({ name, artwork: artwork_data, artworkUrl }),
  });
};
