import { sendMailVerification } from "../../controller/emailController";
import OrderDeclinedWarning from "../../views/order/OrderDeclinedWarning";
import OrderRequestReminder from "../../views/order/OrderRequessstReminder";

type EmailData = {
  name: string;
  email: string;
  artworkTitle: string;
  artistName: string;
  price: string;
  artworkImage: string;
  entity: "artist" | "gallery";
};
export const sendOrderRequestReminder = async ({
  name,
  email,
  artworkTitle,
  artistName,
  price,
  artworkImage,
  entity,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "orders",
    to: email,
    subject: "Notice: Potential Order Request Decline",
    react: OrderRequestReminder({
      name,
      artworkTitle,
      artistName,
      price,
      artworkImage,
      entity,
    }),
  });
};
