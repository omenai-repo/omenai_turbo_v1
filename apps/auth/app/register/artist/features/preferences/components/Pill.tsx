"use client";

import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";

type PillProps = {
  text: string;
  art_styles: string[];
  logo: string;
};
export default function Pill({ text, art_styles, logo }: PillProps) {
  const { artistSignupData, updateArtistSignupData, setIsFieldDirty } =
    useArtistAuthStore();
  const selectPill = (text: string) => {
    updateArtistSignupData("art_style", text);
    setIsFieldDirty("art_style", false);
  };
  return (
    <div
      role="button"
      onClick={() => selectPill(text)}
      className={`relative w-fit grid place-items-center rounded border-2 hover:bg-dark hover:text-white border-dark hover:ring-2 hover:ring-[#E0E0E0] text-[12px] sm:text-fluid-xxs text-dark transition-all ease-linear duration-200 px-3 py-1 ${
        artistSignupData.art_style === text
          ? "border-[6px] border-dark cursor-pointer"
          : ""
      }`}
    >
      <span className="relative z-20 cursor-pointer">{text}</span>
    </div>
  );
}
