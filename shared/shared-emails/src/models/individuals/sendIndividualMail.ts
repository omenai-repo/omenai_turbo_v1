import { sendMailVerification } from "../../controller/emailController.ts";
import UserVerificationEmail from "../../views/individuals/verifyIndividual.tsx";

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
