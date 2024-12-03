import { sendMailVerification } from "../../controller/emailController.ts";
import VerifyGalleryEmail from "../../views/verification/VerifyGalleryEmail.tsx";

type EmailData = {
  name: string;
  email: string;
};
export const sendVerifyGalleryMail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Onboarding",
    from: "onboarding",
    to: email,
    subject: "Gallery account verification request.",
    react: VerifyGalleryEmail(name),
  });
};
