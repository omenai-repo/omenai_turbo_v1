"use client";
import Link from "next/link";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { CircleCheckBig } from "lucide-react";
export default function OrderReceived() {
  const { toggleOrderReceivedModal } = actionStore();
  return (
    <div className="grid place-items-center">
      <div className="flex flex-col justify-center items-center space-y-8 text-center">
        <CircleCheckBig
          size={120}
          color="#44ff00"
          strokeWidth={3}
          absoluteStrokeWidth
        />
        <p className="text-dark text-fluid-xxs font-normal ">
          Your order has been successfully received, we&apos;ll be in touch
          within the next 48 hours with an accurate shipping quote and next
          steps.
        </p>
        <p className="text-dark text-fluid-xxs font-normal my-5">
          Thank you for your patience.
        </p>

        <Link
          onClick={() => toggleOrderReceivedModal(false)}
          href={"/catalog"}
          className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
