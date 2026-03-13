import { sendMailVerification } from "../../controller/emailController";
import SendArtistWaitListInvites from "../../views/admin/SendArtistWaitListInvites";

type EmailData = {
  email: string;
  name: string;
};
export const sendArtistWaitlistInviteEmail = async ({
  email,
  name,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Onboarding",
    from: "Onboarding",
    to: email,
    subject: "OMENAI is Live — Activate Your Profile",
    react: SendArtistWaitListInvites(name),
  });
};
