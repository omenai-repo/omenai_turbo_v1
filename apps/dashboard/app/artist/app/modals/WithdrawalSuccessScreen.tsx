"use client";
import { Paper } from "@mantine/core";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";

import Image from "next/image";
import React from "react";

export default function WithdrawalSuccessScreen() {
  const { toggleWithdrawalFormPopup } = artistActionStore();

  return (
    <Paper
      withBorder
      radius={"md"}
      className="w-full h-full space-y-8 px-8 py-16 grid place-items-center"
    >
      <Image
        src={"/icons/success.png"}
        alt="Success icon"
        height={100}
        width={100}
        unoptimized
      />
      <div className="w-full flex flex-col space-y-6 text-center">
        <h5 className="font-semibold">Transfer initiated successfully</h5>
        <p className="text-fluid-xxs">
          Your transfer request has been queued. It will be deposited into your
          bank account shortly
        </p>
        <button
          onClick={() => toggleWithdrawalFormPopup(false)}
          className="text-fluid-xxs h-[35px] p-5 rounded-md w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white font-normal"
        >
          Go to wallet
        </button>
      </div>
    </Paper>
  );
}
