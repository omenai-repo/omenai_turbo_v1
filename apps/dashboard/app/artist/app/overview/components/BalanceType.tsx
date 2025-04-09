import { CircleArrowOutUpRight } from "lucide-react";
import React from "react";

export default function BalanceType({
  type,
  amount,
}: {
  type: "Pending" | "Available";
  amount: string;
}) {
  return (
    <div className="p-5 bg-dark relative text-white rounded-[30px] my-6 flex items-center 2xl:py-16 py-10">
      <div className="flex flex-col justify-center">
        <p className="font-light 2xl:text-base text-xs text-white/50">
          {type} Balance
        </p>
        <h1 className="font-normal text-lg 2xl:text-xl tracking-tighter">
          {amount}
        </h1>
      </div>
      <div className="absolute top-5 right-6">
        <CircleArrowOutUpRight strokeWidth={1} />
      </div>
    </div>
  );
}
