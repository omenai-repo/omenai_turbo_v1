import React from "react";
import { MdOutlineClear } from "react-icons/md";

export default function CancelFilter() {
  return (
    <div className="w-full">
      <button className="w-full bg-red-600 flex items-center justify-center gap-x-4  h-[35px] px-4 text-white">
        <span>Clear Filters</span>
        <MdOutlineClear />
      </button>
    </div>
  );
}
