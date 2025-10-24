import { sendMailVerification } from "../../controller/emailController";
import SendArtistShipmentSuccess from "../../views/shipment/SendArtistShipmentSuccess";

type EmailData = {
  name: string;
  email: string;
  dashboardUrl: string;
};
export const sendArtistShippmentSuccessfulMail = async ({
  name,
  email,
  dashboardUrl,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai shippment",
    from: "transactions",
    to: email,
    subject: "Funds are available for withdrawal!",
    react: SendArtistShipmentSuccess(name, dashboardUrl),
  });
};
