"use client";

import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";

type PillProps = {
  text: string;
  logo: string;
  artTypes: string[];
};
export default function Pill({ text }: PillProps) {
  const { preferences, updatePreference } = useIndividualAuthStore();
  return (
    <div
      role="button"
      onClick={() => updatePreference(text)}
      className={`relative w-fit grid place-items-center rounded border-2 hover:bg-dark hover:text-white border-dark hover:ring-2 hover:ring-[#E0E0E0] text-[12px] sm:text-fluid-xxs text-dark transition-all ease-linear duration-200 px-3 py-1 ${
        preferences.includes(text) && "border-[6px] border-dark cursor-pointer"
      }`}
    >
      <span className="relative z-20 cursor-pointer">{text}</span>
    </div>
  );
}
