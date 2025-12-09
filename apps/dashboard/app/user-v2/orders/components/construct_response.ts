export const renderButtonAction = ({
  status,
  payment_status,
  tracking_status,
  order_accepted,
  exhibition_active,
}: {
  status: string | null;
  payment_status: string;
  tracking_status: string | null;
  order_accepted: string;
  exhibition_active: boolean;
}) => {
  if (
    (status === "processing" &&
      order_accepted === "accepted" &&
      payment_status === "pending") ||
    payment_status === "failed"
  ) {
    return "pay";
  }
  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "completed" &&
    !exhibition_active &&
    !tracking_status
  ) {
    return "awaiting_tracking";
  }
  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "completed" &&
    !tracking_status &&
    exhibition_active
  ) {
    return "awaiting_shipment_creation";
  }
  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "completed" &&
    tracking_status
  ) {
    return "track";
  }
  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "processing"
  ) {
    return "processing";
  }
};
