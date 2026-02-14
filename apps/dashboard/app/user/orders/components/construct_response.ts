export const renderButtonAction = ({
  status,
  payment_status,
  tracking_status,
  order_accepted,
  exhibition_active,
  delivery_status,
}: {
  status: string | null;
  payment_status: string;
  tracking_status: string | null;
  order_accepted: string;
  exhibition_active: boolean;
  delivery_status: string | null;
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
  if (
    status === "completed" &&
    delivery_status?.toLowerCase() === "delivered"
  ) {
    return "fulfilled";
  }
  if (
    status === "processing" &&
    order_accepted === "" &&
    payment_status === "pending"
  ) {
    return "in_review";
  }
};
