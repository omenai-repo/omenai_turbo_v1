import { sendMailVerification } from "../../controller/emailController";
import BlockArtistMail from "../../views/artist/BlockArtistMail";

type EmailData = {
  name: string;
  email: string;
};
export const sendArtistBlockedMail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your Artist Account Has Been Temporarily Blocked.",
    react: BlockArtistMail(name),
  });
};
