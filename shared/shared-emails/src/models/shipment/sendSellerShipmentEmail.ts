import { sendMailVerification } from "../../controller/emailController";
import SellerShipmentEmail from "../../views/shipment/SendSellerShipmentDetails";
type EmailData = {
  name: string;
  email: string;
  fileContent: string;
  artwork: string;
  artworkImage: string;
  artistName: string;
  price: string;
};
export const sendSellerShipmentEmail = async ({
  name,
  email,
  fileContent,
  artwork,
  artworkImage,
  artistName,
  price,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Shipment created - Prepare for pickup",
    react: SellerShipmentEmail(name, artwork, artworkImage, artistName, price),
    attachments: [
      {
        filename: "waybill.pdf",
        content: fileContent,
      },
    ],
  });
};
