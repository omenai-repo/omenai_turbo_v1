import { sendMailVerification } from "../../controller/emailController";
import MemberInviteEmail from "../../views/admin/MemberInviteEmail";
import RoleUpdateEmail from "../../views/admin/SendRoleChangeMail";

type EmailData = {
  name: string;
  email: string;
  previousRole: string;
  newRole: string;
};
export const sendRoleChangeMail = async ({
  name,
  newRole,
  email,
  previousRole,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai onboarding",
    from: "onboarding",
    to: email,
    subject: "Your admin access role has been updated",
    react: RoleUpdateEmail({ recipientName: name, newRole, previousRole }),
  });
};
