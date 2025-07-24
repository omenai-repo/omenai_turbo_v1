"use client";

import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";

type TabTypes = {
  title: string;
  tag: string;
  mobile: boolean;
};
export default function Tab({ title, tag, mobile = false }: TabTypes) {
  const { selectedTab, setSelectedTab } = artworkActionStore();
  return (
    <button
      onClick={() => setSelectedTab({ title, tag })}
      className={` ${
        selectedTab.tag === tag
          ? "bg-dark text-white border-none"
          : `bg-[#FAFAFA] text-dark border-dark/10 border hover:bg-dark/10`
      } ${
        mobile ? "border-0 border-b-1 border-b-dark/30" : ""
      } text-fluid-xs  px-4 py-2 rounded-xl duration-200`}
    >
      {title}
    </button>
  );
}
