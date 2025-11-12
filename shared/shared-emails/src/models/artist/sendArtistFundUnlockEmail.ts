import { sendMailVerification } from "../../controller/emailController";
import FundUnlockArtistEmail from "../../views/artist/FundUnlockArtistEmail";

type EmailData = {
  name: string;
  email: string;
  amount: number;
};
export const sendArtistFundUnlockEmail = async ({
  name,
  email,
  amount,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your Funds Have Been Unlocked",
    react: FundUnlockArtistEmail(name, amount),
  });
};
