import { sendMailVerification } from "../../controller/emailController.ts";
import PasswordUpdateConfirmationCodeEmail from "../../views/recovery/PasswordUpdateConfirmationCodeEmail.tsx";

type EmailData = {
  username: string;
  token: string;
  gallery_name?: string;
  email: string;
};
export const sendPasswordConfirmationCodeMail = async ({
  username,
  email,
  token,
  gallery_name,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Onboarding",
    from: "onboarding",
    to: email,
    subject: "Password Confirmation Code request",
    react: PasswordUpdateConfirmationCodeEmail(username, token, gallery_name),
  });
};
