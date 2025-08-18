import { sendMailVerification } from "../../controller/emailController";
import MemberInviteEmail from "../../views/admin/MemberInviteEmail";
import UserVerificationEmail from "../../views/individuals/verifyIndividual";

type EmailData = {
  email: string;
  token: string;
};
export const sendMemberInviteEmail = async ({ email, token }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai onboarding",
    from: "onboarding",
    to: email,
    subject: "You've been invited to the Omenai admin team",
    react: MemberInviteEmail({ token }),
  });
};
