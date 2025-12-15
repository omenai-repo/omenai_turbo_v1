import { sendMailVerification } from "../../controller/emailController";
import FundWithdrawalFailedMail from "../../views/artist/FundWithdrawalFailedMail";

type EmailData = {
  name: string;
  email: string;
  amount: string;
};
export const sendArtistFundsWithdrawalFailed = async ({
  name,
  email,
  amount,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "We encountered an issue while processing your withdrawal request",
    react: FundWithdrawalFailedMail(name, amount),
  });
};
