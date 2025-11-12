import { sendMailVerification } from "../../controller/emailController";
import BlockGalleryEmail from "../../views/gallery/BlockGalleryEmail";
type EmailData = {
  name: string;
  email: string;
};
export const sendGalleryBlockedEmail = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your Gallery Account Has Been Temporarily Blocked.",
    react: BlockGalleryEmail(name),
  });
};
