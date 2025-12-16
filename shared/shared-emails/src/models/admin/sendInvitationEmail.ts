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
    prefix: "Omenai Team",
    from: "Team",
    to: email,
    subject: "You've been personally invited to join Omenai",
    react: InvitationEmail(name, inviteCode, email, entity),
  });
};
