import { sendMailVerification } from "../../controller/emailController";
import PasswordUpdateConfirmationCodeEmail from "../../views/recovery/PasswordUpdateConfirmationCodeEmail";

type EmailData = {
  username: string;
  token: string;
  email: string;
};
export const sendPasswordConfirmationCodeMail = async ({
  username,
  email,
  token}: EmailData) => {
  await sendMailVerification({
    prefix: "Onboarding",
    from: "onboarding",
    to: email,
    subject: "Password Confirmation Code request",
    react: PasswordUpdateConfirmationCodeEmail(username, token),
  });
};
