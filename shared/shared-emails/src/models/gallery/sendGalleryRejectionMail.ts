import { sendMailVerification } from "../../controller/emailController.ts";
import RejectGalleryMail from "../../views/gallery/RejectGalleryMail.tsx";

type EmailData = {
  name: string;
  email: string;
};
export const sendGalleryRejectedMail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Onboarding",
    from: "onboarding",
    to: email,
    subject: "Update on Your Gallery Account Verification",
    react: RejectGalleryMail(name),
  });
};
