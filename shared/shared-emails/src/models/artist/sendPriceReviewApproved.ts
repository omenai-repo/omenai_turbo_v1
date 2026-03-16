import { sendMailVerification } from "../../controller/emailController";
import PriceReviewApproved from "../../views/artist/PriceReviewApproved";

type EmailData = {
  name: string;
  email: string;
};
export const sendPriceReviewApproved = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your Price Review Has Been Approved",
    react: PriceReviewApproved(name),
  });
};
