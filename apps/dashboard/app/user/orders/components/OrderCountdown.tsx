"use client";

import { useEffect } from "react";
import { useTimer } from "react-timer-hook";

interface OrderCountdownProps {
  expiresAt: string | Date; // Accepts ISO string or Date
  onExpire?: () => void; // Optional callback when time runs out
}

export default function OrderCountdown({
  expiresAt,
  onExpire,
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
    onExpire: () => {
      console.log("Countdown expired");
      onExpire?.();
    },
  });

  return (
    <div className=" text-center w-fit">
      {isRunning ? (
        <div className="text-gray-700 text-sm flex gap-x-2 items-center font-medium">
          <p className="text-[14px]">Order expires in:</p>
          <div className="flex justify-center gap-2 text-black font-semibold text-sm">
            {days > 0 && <span>{String(days).padStart(2, "0")}d</span>}
            <span>{String(hours).padStart(2, "0")}h</span>
            <span>{String(minutes).padStart(2, "0")}m</span>
            <span>{String(seconds).padStart(2, "0")}s</span>
          </div>
        </div>
      ) : (
        <span className="text-red-600 font-semibold text-sm">
          Order expired
        </span>
      )}
    </div>
  );
}
