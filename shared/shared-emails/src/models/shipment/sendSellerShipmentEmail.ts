import { sendMailVerification } from "../../controller/emailController";
import SellerShipmentEmail from "../../views/shipment/SendSellerShipmentDetails";
type EmailData = {
  name: string;
  email: string;
  fileContent: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  artworkPrice: number;
};
export const sendSellerShipmentEmail = async ({
  name,
  email,
  fileContent,
  artwork,
  artworkImage,
  artistName,
  artworkPrice,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Your shipment has been created and is ready for pickup",
    react: SellerShipmentEmail(
      name,
      artwork,
      artworkImage,
      artistName,
      artworkPrice
    ),
    attachments: [
      {
        filename: "waybill.pdf",
        content: fileContent,
      },
    ],
  });
};
