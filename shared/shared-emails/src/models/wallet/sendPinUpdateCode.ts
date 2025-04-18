import { sendMailVerification } from "../../controller/emailController";
import WalletPinUpdateCode from "../../views/recovery/WalletPinUpdateCodeEmail";

type EmailData = {
  username: string;
  token: string;
  email: string;
};
export const sendPinUpdateCode = async ({
  username,
  email,
  token,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Onboarding",
    from: "onboarding",
    to: email,
    subject: "Pin reset code request",
    react: WalletPinUpdateCode(username, token),
  });
};
