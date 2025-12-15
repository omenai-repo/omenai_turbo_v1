import { sendMailVerification } from "../../controller/emailController";
import FundWithdrawalSuccessMail from "../../views/artist/FundWithdrawalSuccessMail";

type EmailData = {
  name: string;
  email: string;
  amount: string;
};
export const sendArtistFundsWithdrawalSuccessMail = async ({
  name,
  email,
  amount,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your withdrawal has been completed successfully.",
    react: FundWithdrawalSuccessMail(name, amount),
  });
};
