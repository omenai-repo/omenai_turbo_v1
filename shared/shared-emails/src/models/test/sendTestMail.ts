import { sendMailVerification } from "../../controller/emailController";
import SendTestMail from "../../views/test/SendTestMail";
type EmailData = {
  name: string;
  email: string;
};
export const sendTestMail = async ({ name, email }: EmailData) => {
  console.log(process.env.RESEND_API_KEY!);
  const data = await sendMailVerification({
    prefix: "Onboarding",
    from: "orders",
    to: email,
    subject: "Your Artist Account Has Been Successfully Verified!",
    react: SendTestMail(name),
  });
  return data;
};
