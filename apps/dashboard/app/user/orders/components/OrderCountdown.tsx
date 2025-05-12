"use client";

import { useRef } from "react";
import { useTimer } from "react-timer-hook";
import { declineOrderRequest } from "@omenai/shared-services/orders/declineOrderRequest";
import { OrderAcceptedStatusTypes } from "@omenai/shared-types";

interface OrderCountdownProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  order_id: string;
}

export default function OrderCountdown({
  expiresAt,
  onExpire,
  order_id,
}: OrderCountdownProps) {
  // Ensure `expiresAt` is a valid Date object
  const expiryDate =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const hasExpiredRef = useRef(false);

  const { seconds, minutes, hours, days, isRunning } = useTimer({
    expiryTimestamp: expiryDate,
    autoStart: true,
    onExpire: async () => {
      if (hasExpiredRef.current) return;
      hasExpiredRef.current = true;

      const data: OrderAcceptedStatusTypes = {
        status: "declined",
        reason: "The payment period for this artwork has expired.",
      };

      try {
        const response = await declineOrderRequest(data, order_id);
        if (!response?.isOk) {
          console.error("Order decline failed", response);
        }
      } catch (err) {
        console.error("Error declining order:", err);
      }

      // Trigger the optional `onExpire` callback
      onExpire?.();
    },
  });

  // Utility function to format time with leading zeros
  const formatTime = (value: number) => String(value).padStart(2, "0");

  return (
    <div className="text-center w-fit" aria-live="polite">
      {isRunning ? (
        <div className="text-dark text-fluid-sm flex gap-x-2 items-center font-medium">
          <p className="text-fluid-xs">Order expires in:</p>
          <div className="flex justify-center gap-2 text-black font-semibold text-fluid-base">
            {days > 0 && <span>{formatTime(days)}d</span>}
            <span>{formatTime(hours)}h</span>
            <span>{formatTime(minutes)}m</span>
            <span>{formatTime(seconds)}s</span>
          </div>
        </div>
      ) : (
        <span
          className="text-red-600 font-semibold text-fluid-sm"
          aria-label="Order expired"
        >
          Order expired
        </span>
      )}
    </div>
  );
}
