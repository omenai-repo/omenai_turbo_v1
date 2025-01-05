import { sendMailVerification } from "../../controller/emailController";
import ArtistVerificationEmail from "../../views/artist/verifyArtistMail";

type EmailData = {
  name: string;
  email: string;
  token: string;
};
export const sendArtistSignupMail = async ({
  name,
  email,
  token,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Onboarding",
    from: "onboarding",
    to: email,
    subject: "Verify your Artist account on Omenai",
    react: ArtistVerificationEmail(name, token),
  });
};
