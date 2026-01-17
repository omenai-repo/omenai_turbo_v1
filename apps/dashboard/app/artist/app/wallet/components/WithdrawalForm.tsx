import { Input, Paper, PinInput } from "@mantine/core";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { CircleDollarSign, RefreshCcwDot } from "lucide-react";
import React from "react";

export default function WithdrawalForm() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-5">
        <p className="text-fluid-xxs font-medium">Enter withdrawal amount</p>
        <Paper radius="sm" withBorder className="p-5 flex flex-col space-y-2">
          <p className="text-fluid-xxs font-medium">You Send ($)</p>
          <input className={INPUT_CLASS} placeholder="0.0" />
        </Paper>

        <div className="flex justify-center w-full my-4">
          <div className="flex flex-col items-center">
            <button className="h-[35px] p-4 rounded w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal">
              <RefreshCcwDot size={20} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            <span className="text-fluid-xxs">Click to convert</span>{" "}
          </div>
        </div>

        <Paper radius="sm" withBorder className="p-5 flex flex-col space-y-2">
          <p className="text-fluid-xxs font-medium">You Get (FCFA)</p>
          <Paper className="p-5" radius="sm" withBorder></Paper>
        </Paper>

        <Paper radius="sm" withBorder className="p-5 flex flex-col space-y-2">
          <p className="text-fluid-xxs font-medium">Enter wallet pin</p>
          <div className="flex flex-col space-y-4">
            <div className="w-full flex justify-center">
              <PinInput size="md" mask placeholder="*" type="number" />
            </div>
            <p className="text-red-600 font-medium text-fluid-xxs text-center my-5">
              Forgot pin?
            </p>
          </div>
        </Paper>
      </div>

      <div className="w-full flex justify-center">
        <button className="h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal">
          Withdraw
        </button>
      </div>
    </div>
  );
}
