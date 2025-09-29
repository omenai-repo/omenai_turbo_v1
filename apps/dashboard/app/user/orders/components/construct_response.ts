export const renderButtonAction = ({
  status,
  payment_status,
  tracking_status,
  order_accepted,
}: {
  status: string;
  payment_status: string;
  tracking_status: string;
  order_accepted: string;
}) => {
  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "pending" || payment_status === 'failed'
  ) {
    return "pay";
  }
  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "completed" &&
    tracking_status === ""
  ) {
    return "awaiting_tracking";
  }
  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "completed" &&
    tracking_status !== ""
  ) {
    return "track";
  }
  if (
    status === "processing" &&
    order_accepted === "accepted" &&
    payment_status === "processing" 
  ) {
    return 'processing';
  }
};
