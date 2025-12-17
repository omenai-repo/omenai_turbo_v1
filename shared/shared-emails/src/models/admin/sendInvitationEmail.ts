import { sendMailVerification } from "../../controller/emailController";
import InvitationEmail from "../../views/admin/InvitationEmail";

type EmailData = {
  email: string;
  name: string;
  inviteCode: string;
  entity: string;
};
export const sendInvitationEmail = async ({
  email,
  name,
  inviteCode,
  entity,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Onboarding",
    from: "Onboarding",
    to: email,
    subject: "Join Omenai: An Invitation for Your Gallery",
    react: InvitationEmail(name, inviteCode, email, entity),
  });
};
