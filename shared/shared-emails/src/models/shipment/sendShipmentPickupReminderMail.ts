import { AddressTypes, ArtworkSchemaTypes } from "@omenai/shared-types";
import { sendMailVerification } from "../../controller/emailController";
import BuyerShipmentEmail from "../../views/shipment/SendBuyerShipmentDetails";
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
}: EmailData) => {
  await sendMailVerification({
    prefix: "Orders",
    from: "orders",
    to: email,
    subject: "Your shipment has been created and is ready for pickup",
    react: ShipmentPickupNotificationEmail({
      galleryName: name,
      artwork,
      orderId,
      buyerName,
      pickupAddress,
      estimatedPickupDate,
      daysLeft,
    }),
  });
};
