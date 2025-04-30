"use client";

import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import Link from "next/link";

export default function OnboardingRequestModalForm() {
  const { setOpenOnboardingCompletedModal } = actionStore();

  return (
    <div>
      <h1 className="text-fluid-base font-semibold mb-4 text-dark">
        Onboarding completed
      </h1>
      <div className="flex flex-col gap-4 font-normal text-fluid-base">
        <div className="bg-[#fafafa] rounded-[20px] px-5 py-8 flex flex-col gap-5">
          <p className="text-fluid-xs">
            We have received your information and are currently verifying your
            details. This process typically takes between 24 to 48 hours. We
            appreciate your patience.”
          </p>
        </div>
      </div>

      <div className="w-full mt-5 flex items-center gap-x-2">
        <Link
          href={"/artist/onboarding"}
          type="button"
          onClick={() => setOpenOnboardingCompletedModal(false)}
          className="h-[35px] p-5 rounded-full w-full flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
