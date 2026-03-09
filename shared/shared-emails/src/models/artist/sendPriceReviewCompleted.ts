import { sendMailVerification } from "../../controller/emailController";
import PriceReviewCompleted from "../../views/artist/PriceReviewCompleted";

type EmailData = {
  name: string;
  email: string;
};
export const sendPriceReviewCompleted = async ({ name, email }: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your Price Review Has Been Completed",
    react: PriceReviewCompleted(name),
  });
};
