"use client";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function CurrencyDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 ring-1 border-0 ring-dark/10 text-xs text-dark rounded-full hover:bg-gray-800 transition"
      >
        USD
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-48 bg-white shadow-lg rounded-[20px] overflow-hidden">
          <ul className="py-1 text-gray-700 text-xs">
            <li>
              <button className="block w-full px-4 py-2 hover:bg-gray-100">
                Profile
              </button>
            </li>
            <li>
              <button className="block w-full px-4 py-2 hover:bg-gray-100">
                Settings
              </button>
            </li>
            <li>
              <button className="block w-full px-4 py-2 text-red-500 hover:bg-gray-100">
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
