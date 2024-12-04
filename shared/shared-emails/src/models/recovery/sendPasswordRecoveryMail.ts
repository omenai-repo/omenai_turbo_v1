import { sendMailVerification } from "../../controller/emailController";
import PasswordRecoveryEmail from "../../views/recovery/PasswordRecoveryEmail";

type EmailData = {
  name: string;
  email: string;
  token: string;
  gallery_name?: string;
  route: "individual" | "gallery";
};
export const sendPasswordRecoveryMail = async ({
  name,
  email,
  token,
  gallery_name,
  route,
}: EmailData) => {
  // Set up resend here instead
  await sendMailVerification({
    prefix: "Onboarding",
    from: "transactions",
    to: email,
    subject: "Reset your password",
    react: PasswordRecoveryEmail(name, token, route, gallery_name),
  });
};
