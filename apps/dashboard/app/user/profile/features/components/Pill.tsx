"use client";

import { individualProfileUdateStore } from "@omenai/shared-state-store/src/individual/individual_profile_update/IndividualProfileUpdateStore";

type PillProps = {
  text: string;
  selected?: boolean;
};
export default function Pill({ text }: PillProps) {
  const { updateData, setProfileUpdateData } = individualProfileUdateStore();
  return (
    <button
      type="button"
      onClick={() => setProfileUpdateData("preferences", text)}
      className={`rounded-full w-fit border border-[#E0E0E0] hover:ring-2 hover:ring-[#E0E0E0]  transition-all ease-linear duration-100 px-3 py-2 
    ${
      updateData?.preferences?.includes(text)
        ? "bg-dark text-white"
        : "bg-transparent text-dark"
    }
      `}
    >
      {text}
    </button>
  );
}
