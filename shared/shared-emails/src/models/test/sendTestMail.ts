import { sendMailVerification } from "../../controller/emailController";
import SendTestMail from "../../views/test/SendTestMail";
type EmailData = {
  name: string;
  email: string;
};
export const sendTestMail = async ({ name, email }: EmailData) => {
  const data = await sendMailVerification({
    prefix: "Omenai onboarding",
    from: "orders",
    to: email,
    subject: "Your Artist Account Has Been Successfully Verified!",
    react: SendTestMail(name),
  });
  return data;
};
