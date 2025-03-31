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
    <button
      onClick={() => selectPill(text)}
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
        artistSignupData.art_style === text ? "border-[6px] border-dark" : ""
      }`}
    >
      <span className="absolute bg-dark/30 h-full w-full rounded-[15px] z-10" />
      <span className="relative z-20 font-semibold">{text}</span>
    </button>
  );
}
