"use client";

import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";

type PillProps = {
  text: string;
  logo: string;
  artTypes: string[];
};
export default function Pill({ text, logo, artTypes }: PillProps) {
  const { preferences, updatePreference } = useIndividualAuthStore();
  return (
    <button
      onClick={() => updatePreference(text)}
      type="button"
      style={{
        backgroundImage: `url(/${logo}.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "transparent",
        backgroundBlendMode: "multiply",
      }}
      className={`relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] grid place-items-center rounded-[20px] border-2 border-dark hover:ring-2 hover:ring-[#E0E0E0] text-[12px] sm:text-[14px] text-white transition-all ease-linear duration-200 px-3 py-1 ${
        preferences.includes(text) && "border-[6px] border-dark"
      }`}
    >
      <span className="absolute bg-dark/30 h-full w-full rounded-[15px] z-10" />
      <span className="relative z-20 font-semibold">{text}</span>
    </button>
  );
}
