import { sendMailVerification } from "../../controller/emailController.ts";
import AcceptGalleryMail from "../../views/gallery/AcceptGalleryMail.tsx";
type EmailData = {
  name: string;
  email: string;
};
export const sendGalleryAcceptedMail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Onboarding",
    from: "onboarding",
    to: email,
    subject: "Your Gallery Account Has Been Successfully Verified!",
    react: AcceptGalleryMail(name),
  });
};
