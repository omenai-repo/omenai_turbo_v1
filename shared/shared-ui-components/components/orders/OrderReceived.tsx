"use client";
import Link from "next/link";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
export default function OrderReceived() {
  const { toggleOrderReceivedModal } = actionStore();
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-dark text-[14px] font-normal ">
        Your order has been successfully received, we&apos;ll be in touch within
        the next 48 hours with an accurate shipping quote and next steps.
      </p>
      <p className="text-dark text-[14px] font-normal my-5">
        Thank you for your patience
      </p>

      <Link
        onClick={() => toggleOrderReceivedModal(false)}
        href={"/"}
        className="h-[40px] px-4 w-full bg-black grid place-items-center text-white cursor-pointer mt-[50px]"
      >
        Continue shopping
      </Link>
    </div>
  );
}
