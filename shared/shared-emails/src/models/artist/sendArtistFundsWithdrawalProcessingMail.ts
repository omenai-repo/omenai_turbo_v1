import { sendMailVerification } from "../../controller/emailController";
import FundWithdrawalProcessingMail from "../../views/artist/FundWithdrawalProcessingMail";

type EmailData = {
  name: string;
  email: string;
  amount: string;
};
export const sendArtistFundsWithdrawalProcessingMail = async ({
  name,
  email,
  amount,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your withdrawal request has been received",
    react: FundWithdrawalProcessingMail(name, amount),
  });
};
