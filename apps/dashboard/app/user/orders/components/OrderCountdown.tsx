"use client";

import { declineOrderRequest } from "@omenai/shared-services/orders/declineOrderRequest";
import { OrderAcceptedStatusTypes } from "@omenai/shared-types";
import { useEffect } from "react";
import { useTimer } from "react-timer-hook";

interface OrderCountdownProps {
  expiresAt: string | Date; // Accepts ISO string or Date
  onExpire?: () => void; // Optional callback when time runs out
  order_id: string;
}

export default function OrderCountdown({
  expiresAt,
  onExpire,
  order_id,
}: OrderCountdownProps) {
  const expiryDate = new Date(expiresAt);

  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp: expiryDate,
    onExpire: async () => {
      const data: OrderAcceptedStatusTypes = {
        status: "declined",
        reason: "The payment period for this artwork has expired.",
      };
      const decline_order = await declineOrderRequest(data, order_id);
      if (!decline_order?.isOk) {
      } // Do error logging here
      onExpire?.();
    },
  });

  return (
    <div className=" text-center w-fit">
      {isRunning ? (
        <div className="text-dark text-fluid-sm flex gap-x-2 items-center font-medium">
          <p className="text-fluid-xs">Order expires in:</p>
          <div className="flex justify-center gap-2 text-black font-semibold text-fluid-base">
            {days > 0 && <span>{String(days).padStart(2, "0")}d</span>}
            <span>{String(hours).padStart(2, "0")}h</span>
            <span>{String(minutes).padStart(2, "0")}m</span>
            <span>{String(seconds).padStart(2, "0")}s</span>
          </div>
        </div>
      ) : (
        <span className="text-red-600 font-semibold text-fluid-sm">
          Order expired
        </span>
      )}
    </div>
  );
}
