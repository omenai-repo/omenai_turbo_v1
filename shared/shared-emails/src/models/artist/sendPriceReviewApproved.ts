import { sendMailVerification } from "../../controller/emailController";
import PriceReviewApproved from "../../views/artist/PriceReviewApproved";

type EmailData = {
  name: string;
  email: string;
  artwork_title: string;
};
export const sendPriceReviewApproved = async ({
  name,
  email,
  artwork_title,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your Price Review Has Been Approved",
    react: PriceReviewApproved({ name, artwork_title }),
  });
};
