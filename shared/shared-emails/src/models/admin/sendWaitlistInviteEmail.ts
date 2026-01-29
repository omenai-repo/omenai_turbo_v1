import { sendMailVerification } from "../../controller/emailController";
import SendWaitListInvites from "../../views/admin/SendWaitListInvites";

type EmailData = {
  email: string;
  name: string;
  entity: string;
};
export const sendWaitlistInviteEmail = async ({
  email,
  name,
  entity,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Onboarding",
    from: "Onboarding",
    to: email,
    subject: "🎉 We're Live!",
    react: SendWaitListInvites(name, email, entity),
  });
};
