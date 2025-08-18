import { sendMailVerification } from "../../controller/emailController";
import VerifyArtistMail from "../../views/verification/VerifyArtistMail";

type EmailData = {
  name: string;
  email: string;
};
export const sendVerifyArtistMail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai onboarding",
    from: "onboarding",
    to: email,
    subject: "Artist verification request.",
    react: VerifyArtistMail(name),
  });
};
