import { sendMailVerification } from "../../controller/emailController";
import PriceReviewRequest from "../../views/artist/PriceReviewRequest";

type EmailData = {
  name: string;
  email: string;
  artwork_title: string;
};
export const sendPriceReviewRequest = async ({
  name,
  email,
  artwork_title,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "team",
    to: email,
    subject: "Your Price Review Request Has Been Submitted",
    react: PriceReviewRequest({ name, artwork_title }),
  });
};
