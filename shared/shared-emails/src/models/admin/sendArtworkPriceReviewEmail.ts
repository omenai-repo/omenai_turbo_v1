import { sendMailVerification } from "../../controller/emailController";
import ArtworkPriceReviewEmail from "../../views/admin/ArtworkPriceReviewEmail";

type EmailData = {
  email: string;
  name: string;
};
export const sendArtworkPriceReviewEmail = async ({
  email,
  name,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai Team",
    from: "Team",
    to: email,
    subject: "New Artwork Price Review Request",
    react: ArtworkPriceReviewEmail(name),
  });
};
