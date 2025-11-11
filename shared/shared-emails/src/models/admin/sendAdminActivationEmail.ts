import { sendMailVerification } from "../../controller/emailController";
import ActivateAdminEmail from "../../views/admin/ActivateAdminEmail";
import MemberInviteEmail from "../../views/admin/MemberInviteEmail";
import UserVerificationEmail from "../../views/individuals/verifyIndividual";

type EmailData = {
  email: string;
  name: string;
};
export const sendAdminActivationEmail = async ({ email, name }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "Team",
    to: email,
    subject: "Welcome to the Admin Team",
    react: ActivateAdminEmail({ name }),
  });
};
