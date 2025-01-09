import { sendMailVerification } from "../../controller/emailController";
import AcceptArtistMail from "../../views/artist/AcceptArtistMail";
type EmailData = {
  name: string;
  email: string;
};
export const sendArtistAcceptedMail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Onboarding",
    from: "onboarding",
    to: email,
    subject: "Your Artist Account Has Been Successfully Verified!",
    react: AcceptArtistMail(name),
  });
};
