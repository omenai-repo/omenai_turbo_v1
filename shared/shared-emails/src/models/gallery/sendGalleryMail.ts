import { sendMailVerification } from "../../controller/emailController";
import GalleryVerificationEmail from "../../views/gallery/verifyGallery";

type EmailData = {
  name: string;
  email: string;
  token: string;
};
export const sendGalleryMail = async ({ name, email, token }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai onboarding",
    from: "onboarding",
    to: email,
    subject: "Verify your Omenai Gallery account.",
    react: GalleryVerificationEmail(name, token),
  });
};
