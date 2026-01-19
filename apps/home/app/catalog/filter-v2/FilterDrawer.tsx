"use client";

import { useFilterDrawer } from "./FilterDrawerProvider";
import { MdClose } from "react-icons/md";
import FilterSections from "./FilterSections";
import ActiveFilterPills from "./ActiveFilterPills";
import FilterActions from "./FilterActions";

export default function FilterDrawer() {
  const { isOpen, closeDrawer } = useFilterDrawer();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-dark/40 z-[30] transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[90%] md:w-[25%] bg-white z-[40] shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="flex justify-between items-center p-5 border-b border-b-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-widest text-dark">
            Filter artworks
          </h3>
          <button onClick={closeDrawer}>
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Filter Options */}
        <div className="flex-1 overflow-y-auto p-4">
          <FilterSections />
        </div>

        <div className="border-t p-4">
          <FilterActions />
        </div>
      </div>
    </>
  );
}
