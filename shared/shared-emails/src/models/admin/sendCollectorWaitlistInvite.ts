import { sendMailVerification } from "../../controller/emailController";
import SendCollectorWaitlistInvite from "../../views/admin/SendCollectorWaitlistInvite";

type EmailData = {
  email: string;
  name: string;
};
export const sendCollectorWaitlistInvite = async ({
  email,
  name,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Onboarding",
    from: "Onboarding",
    to: email,
    subject: "OMENAI is Now Live",
    react: SendCollectorWaitlistInvite(name),
  });
};
