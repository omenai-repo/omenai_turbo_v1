import { Input, Paper, PinInput } from "@mantine/core";
import { CircleDollarSign, RefreshCcwDot } from "lucide-react";
import React from "react";

export default function WithdrawalForm() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-5">
        <p className="text-fluid-xs font-medium">Enter withdrawal amount</p>
        <Paper radius="lg" withBorder className="p-5 flex flex-col space-y-2">
          <p className="text-fluid-xs font-medium">You Send ($)</p>
          <input
            className="disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-dark/30 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-fluid-xs font-medium h-[35px] p-5 rounded w-full placeholder:text-fluid-xs placeholder:text-dark/40 "
            placeholder="0.0"
          />
        </Paper>

        <div className="flex justify-center w-full my-4">
          <div className="flex flex-col items-center">
            <button className="h-[35px] p-4 rounded w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal">
              <RefreshCcwDot size={20} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            <span className="text-fluid-xs">Click to convert</span>{" "}
          </div>
        </div>

        <Paper radius="lg" withBorder className="p-5 flex flex-col space-y-2">
          <p className="text-fluid-xs font-medium">You Get (FCFA)</p>
          <Paper className="p-5" radius="lg" withBorder></Paper>
        </Paper>

        <Paper radius="lg" withBorder className="p-5 flex flex-col space-y-2">
          <p className="text-fluid-xs font-medium">Enter wallet pin</p>
          <div className="flex flex-col space-y-4">
            <div className="w-full flex justify-center">
              <PinInput size="md" mask placeholder="*" type="number" />
            </div>
            <p className="text-red-600 font-medium text-fluid-xs text-center my-5">
              Forgot pin?
            </p>
          </div>
        </Paper>
      </div>

      <div className="w-full flex justify-center">
        <button className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal">
          Withdraw
        </button>
      </div>
    </div>
  );
}
