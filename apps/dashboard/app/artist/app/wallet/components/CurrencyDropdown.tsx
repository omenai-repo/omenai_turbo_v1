"use client";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";
import { getDynamicYears } from "@omenai/shared-utils/src/getDynamicYears";
import { QueryClient } from "@tanstack/react-query";
import Image from "next/image";
export default function CurrencyDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-blocktext-left">
      {/* Dropdown Button */}
      <button
        // onClick={() => setIsOpen(!isOpen)}
        className="flex gap-x-2 items-center gap-2 px-4 py-2 ring-1 border-0 bg-white ring-dark/10 text-fluid-xxs text-dark rounded-full hover:bg-gray-800 transition"
      >
        <Image src={"/icons/usa.png"} alt="usa icon" height={24} width={24} />
        USD
      </button>
    </div>
  );
}
