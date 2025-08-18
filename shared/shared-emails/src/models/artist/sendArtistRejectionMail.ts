import { sendMailVerification } from "../../controller/emailController";
import RejectArtistMail from "../../views/artist/RejectArtistMail";

type EmailData = {
  name: string;
  email: string;
};
export const sendArtistRejectedMail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai onboarding",
    from: "onboarding",
    to: email,
    subject: "Update on Your Gallery Account Verification",
    react: RejectArtistMail(name),
  });
};
