import { sendMailVerification } from "../../controller/emailController";
import UserVerificationEmail from "../../views/individuals/verifyIndividual";

type EmailData = {
  name: string;
  email: string;
  token: string;
};
export const sendIndividualMail = async ({ name, email, token }: EmailData) => {
  await sendMailVerification({
    prefix: "Onboarding",
    from: "onboarding",
    to: email,
    subject: "Verify your Omenai account.",
    react: UserVerificationEmail(name, token),
  });
};
