import { sendMailVerification } from "../../controller/emailController";
import OrderRequestToGalleryMail from "../../views/order/OrderRequestToGalleryEmail";

type EmailData = {
  name: string;
  email: string;
  artwork_data: any;
  buyer: string;
  date: string;
  orderUrl: string;
};
export const sendOrderRequestToGalleryMail = async ({
  name,
  email,
  buyer,
  date,
  artwork_data,
  orderUrl,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Advisory",
    from: "orders",
    to: email,
    subject: "Notification of order request for Your Artwork",
    react: OrderRequestToGalleryMail({
      name,
      buyer,
      date,
      artwork_data,
      orderUrl,
    }),
  });
};
