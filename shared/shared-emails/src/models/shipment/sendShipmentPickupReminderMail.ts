import { AddressTypes, ArtworkSchemaTypes } from "@omenai/shared-types";
import { sendMailVerification } from "../../controller/emailController";
import ShipmentPickupNotificationEmail from "../../views/shipment/SendShipmentPickupReminder";
type EmailData = {
  name: string;
  email: string;
  artwork: Pick<ArtworkSchemaTypes, "title" | "artist" | "art_id">;
  orderId: string;
  buyerName: string;
  pickupAddress: AddressTypes;
  estimatedPickupDate?: string;
  daysLeft: string;
  artworkImage: string;
  artistName: string;
  price: string;
};
export const sendShipmentPickupReminderMail = async ({
  name,
  email,
  artwork,
  orderId,
  buyerName,
  pickupAddress,
  estimatedPickupDate,
  daysLeft,
  artworkImage,
  artistName,
  price,
}: EmailData) => {
  await sendMailVerification({
    prefix: "Omenai orders",
    from: "orders",
    to: email,
    subject: "Shipment Pickup Schedule Reminder - Action Required",
    react: ShipmentPickupNotificationEmail({
      galleryName: name,
      artwork,
      orderId,
      buyerName,
      pickupAddress,
      estimatedPickupDate,
      daysLeft,
      artworkImage,
      artistName,
      price,
    }),
  });
};
