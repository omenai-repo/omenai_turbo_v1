import { Alert } from "@mantine/core";
import { ShieldAlert } from "lucide-react";

export default function WarningAlert() {
  const icon = <ShieldAlert size={20} strokeWidth={1.5} absoluteStrokeWidth />;
  return (
    <Alert
      variant="light"
      color="red"
      radius="lg"
      title="Kindly review the following information carefully before continuing."
      icon={icon}
    >
      By accepting this order, you agree to hold the artwork for 24 hours to
      allow for payment and shipment processing. If the piece is on exhibition
      and paid for by this buyer, shipment will be scheduled at the exhibition’s
      end date
    </Alert>
  );
}
