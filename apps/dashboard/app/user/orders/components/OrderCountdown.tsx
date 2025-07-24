"use client";

import { useTimer } from "react-timer-hook";
import Link from "next/link";
import { base_url } from "@omenai/url-config/src/config";

interface OrderCountdownProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  order_id: string;
  user_id: string;
}

export default function OrderCountdown({
  expiresAt,
  onExpire,
  order_id,
  user_id,
}: OrderCountdownProps) {
  // Ensure `expiresAt` is a valid Date object
  const expiryDate =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  // const hasExpiredRef = useRef(false);

  const { seconds, minutes, hours, days, isRunning } = useTimer({
    expiryTimestamp: expiryDate,
    autoStart: true,
    onExpire: async () => {
      // Trigger the optional `onExpire` callback
      onExpire?.();
    },
  });

  // Utility function to format time with leading zeros
  const formatTime = (value: number) => String(value).padStart(2, "0");

  return (
    <div className="text-center w-fit" aria-live="polite">
      {isRunning ? (
        <div className="flex flex-col sm:flex-row gap-x-4 gap-y-2">
          <Link href={`${base_url()}/payment/${order_id}?id_key=${user_id}`}>
            <button className=" bg-dark rounded-xl text-white w-fit disabled:bg-dark/10 text-fluid-xs disabled:cursor-not-allowed h-[35px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80">
              <span>Pay for this artwork</span>
            </button>
          </Link>

          <div className="text-dark text-fluid-xs flex gap-x-2 items-center font-medium">
            <p className="text-fluid-xs">Order expires in:</p>
            <div className="flex justify-center gap-2 text-black font-semibold text-fluid-xs">
              {days > 0 && <span>{formatTime(days)}d</span>}
              <span>{formatTime(hours)}h</span>
              <span>{formatTime(minutes)}m</span>
              <span>{formatTime(seconds)}s</span>
            </div>
          </div>
        </div>
      ) : (
        <span
          className="text-red-600 font-semibold text-fluid-xs"
          aria-label="Order expired"
        >
          Order expired
        </span>
      )}
    </div>
  );
}
