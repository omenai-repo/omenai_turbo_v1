import { sendMailVerification } from "../../controller/emailController";
import AcceptGalleryMail from "../../views/gallery/AcceptGalleryMail";
type EmailData = {
  name: string;
  email: string;
};
export const sendGalleryAcceptedMail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai onboarding",
    from: "onboarding",
    to: email,
    subject: "Your Gallery Account Has Been Successfully Verified!",
    react: AcceptGalleryMail(name),
  });
};
