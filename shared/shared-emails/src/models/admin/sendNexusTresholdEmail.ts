import { sendMailVerification } from "../../controller/emailController";
import NexusTreshold from "../../views/admin/NexusTreshold";

type EmailData = {
  email: string;
  state: string;
};
export const sendNexusTresholdEmail = async ({ email, state }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "Team",
    to: email,
    subject: "Nexus Threshold Breach Notification",
    react: NexusTreshold({ state }),
  });
};
