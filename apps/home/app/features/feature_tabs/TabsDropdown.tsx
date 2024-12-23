"use client";

import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { MdArrowRightAlt } from "react-icons/md";
import Link from "next/link";
import { useContext, useState } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { IndividualSchemaTypes } from "@omenai/shared-types";

type TabDropdownTypes = {
  catalogue: boolean;
};
export function TabsDropdown({ catalogue }: TabDropdownTypes) {
  const { session } = useContext(SessionContext);
  const [dropdown, setDropDown] = useState(false);
  const { selectedTab, setSelectedTab } = artworkActionStore();

  function updatetabState(title: string, tag: string) {
    setSelectedTab({ title, tag });
    setDropDown(false);
  }

  return (
    <div className="flex justify-between items-center md:hidden w-full relative">
      <div
        onClick={() => setDropDown(!dropdown)}
        className="py-3 px-4 flex items-center gap-x-4 border-dark/30 border rounded-full text-xs bg-dark text-white"
      >
        <span>{selectedTab.title}</span>
        <MdOutlineKeyboardArrowDown />
      </div>
      <div
        className={`w-[150px] ${
          dropdown ? "flex" : "hidden"
        } border border-dark/10 duration-200 z-20 items-center bg-white text-xs flex-col absolute top-[3.5rem] left-0`}
      >
        <p
          onClick={() => updatetabState("Recently uploaded", "recent")}
          className="hover:bg-dark/20 duration-200 py-4 px-2"
        >
          Recently uploaded
        </p>
        <p
          onClick={() => updatetabState("Trending uploads", "trending")}
          className="hover:bg-dark/20 duration-200 py-4 px-2"
        >
          Trending uploads
        </p>
        {/* <p
          onClick={() => updatetabState("Art collections", "collections")}
          className="hover:bg-dark/20 duration-200 py-4 px-2"
        >
          Art collections
        </p> */}
        <div>
          {(session as IndividualSchemaTypes)?.role === "user" && (
            <p
              className="hover:bg-dark/20 duration-200 py-4 px-2"
              onClick={() => updatetabState("Tailored for you", "tailored")}
            >
              Tailored for you
            </p>
          )}
        </div>
      </div>
      <div className={`${catalogue ? "hidden" : "block"}`}>
        <Link href={"/catalog"} className="flex items-center gap-x-2 text-xs">
          <span>See more</span>
          <MdArrowRightAlt />
        </Link>
      </div>
    </div>
  );
}
