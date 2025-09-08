"use client";

import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { MdArrowRightAlt } from "react-icons/md";
import Link from "next/link";
import { useState } from "react";
import { artworkActionStore } from "@omenai/shared-state-store/src/artworks/ArtworkActionStore";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

type TabDropdownTypes = {
  catalogue: boolean;
};
export function TabsDropdown({ catalogue }: TabDropdownTypes) {
  const { user } = useAuth({ requiredRole: "user" });
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
        className="py-3 px-4 flex items-center gap-x-4 border-dark/30 border rounded-md text-fluid-xs bg-dark text-white"
      >
        <span>{selectedTab.title}</span>
        <MdOutlineKeyboardArrowDown />
      </div>
      <div
        className={`w-[150px] ${
          dropdown ? "flex" : "hidden"
        } border border-dark/10 duration-200 z-20 items-center bg-white text-fluid-xs flex-col absolute top-[3.5rem] left-0`}
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
          {user && (
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
        <Link
          href={"/catalog"}
          className="flex items-center gap-x-2 text-fluid-xs"
        >
          <span>See more</span>
          <MdArrowRightAlt />
        </Link>
      </div>
    </div>
  );
}
