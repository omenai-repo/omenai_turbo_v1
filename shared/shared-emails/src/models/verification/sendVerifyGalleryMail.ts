import { sendMailVerification } from "../../controller/emailController";
import VerifyGalleryEmail from "../../views/verification/VerifyGalleryEmail";

type EmailData = {
  name: string;
  email: string;
};
export const sendVerifyGalleryMail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai onboarding",
    from: "onboarding",
    to: email,
    subject: "Gallery account verification request.",
    react: VerifyGalleryEmail(name),
  });
};
