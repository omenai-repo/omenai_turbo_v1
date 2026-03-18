import { sendMailVerification } from "../../controller/emailController";
import ArtworkPriceReviewEmail from "../../views/admin/ArtworkPriceReviewEmail";

type EmailData = {
  email: string;
  name: string;
  artwork_title: string;
  requested_price: string;
};
export const sendArtworkPriceReviewEmail = async ({
  email,
  name,
  artwork_title,
  requested_price,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "Team",
    to: email,
    subject: "New Artwork Price Review Request",
    react: ArtworkPriceReviewEmail({ name, artwork_title, requested_price }),
  });
};
