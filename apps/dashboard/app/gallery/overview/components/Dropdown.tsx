"use client";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { getDynamicYears } from "@omenai/shared-utils/src/getDynamicYears";
import { QueryClient } from "@tanstack/react-query";
export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { sales_activity_year, set_sales_activity_year } = artistActionStore();

  const queryClient = new QueryClient();
  const handleYearChange = (year: string) => {
    set_sales_activity_year(year);
    setIsOpen(!isOpen);
    queryClient.invalidateQueries({
      queryKey: ["get_overview_sales_activity"],
    });
  };

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 ring-1 border-0 ring-dark/10 text-fluid-xxs text-dark rounded hover:bg-gray-800 transition"
      >
        {sales_activity_year}
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-fit px-4 bg-white shadow-lg z-30 rounded overflow-hidden">
          <ul className="py-1 text-dark text-fluid-xxs">
            {getDynamicYears().map((year) => {
              return (
                <li key={year}>
                  <button
                    type="button"
                    onClick={() => handleYearChange(year)}
                    className="block w-full px-4 py-2 text-fluid-xxs hover:bg-gray-100"
                  >
                    {year}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
