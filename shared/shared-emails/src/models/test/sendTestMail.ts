import { sendMailVerification } from "../../controller/emailController";
import SendTestMail from "../../views/test/SendTestMail";
type EmailData = {
  name: string;
  email: string;
  cta: string;
};
export const sendTestMail = async ({ name, email, cta }: EmailData) => {
  const data = await sendMailVerification({
    prefix: "Omenai",
    from: "orders",
    to: email,
    subject: "Deeplink test mail",
    react: SendTestMail({ name, cta }),
  });
  return data;
};
