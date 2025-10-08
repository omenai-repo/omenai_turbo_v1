"use client";

import { Paper } from "@mantine/core";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import Link from "next/link";
import Image from "next/image";
import { dashboard_url } from "@omenai/url-config/src/config";
export default function OnboardingRequestModalForm() {
  const { setOpenOnboardingCompletedModal } = actionStore();

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
        <h5 className="font-semibold">Onboarding completed successfully</h5>
        <p className="text-fluid-xxs">
          We have received your information and are currently verifying your
          details. This process typically takes between 24 to 48 hours. We
          appreciate your patience.
        </p>
        <Link href={`${dashboard_url()}/artist/app/overview`}>
          <button
            onClick={() => setOpenOnboardingCompletedModal(false)}
            className="text-fluid-xxs h-[35px] p-5 rounded w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white font-normal"
          >
            Go to dashboard
          </button>
        </Link>
      </div>
    </Paper>
  );
}
