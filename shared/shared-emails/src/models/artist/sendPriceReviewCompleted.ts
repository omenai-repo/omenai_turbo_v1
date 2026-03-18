import { sendMailVerification } from "../../controller/emailController";
import PriceReviewCompleted from "../../views/artist/PriceReviewCompleted";

type EmailData = {
  name: string;
  email: string;
  artwork_title: string;
};
export const sendPriceReviewCompleted = async ({
  name,
  email,
  artwork_title,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your Price Review Has Been Completed",
    react: PriceReviewCompleted({ name, artwork_title }),
  });
};
