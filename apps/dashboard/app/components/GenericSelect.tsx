"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

export const GenericSelect = ({
  items,
  value,
  onChange,
  disabled,
  placeholder = "Select an option",
}: {
  items: string[];
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter items based on search term
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm(""); // Clear search when closing via click outside
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const toggleOpen = () => {
    if (disabled) return;
    const newState = !isOpen;
    setIsOpen(newState);
    if (!newState) setSearchTerm(""); // Clear search when closing via toggle
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between px-3 py-3.5  border border-slate-300 focus:border-dark outline-none focus:ring-0 rounded-md text-sm transition-all duration-200 
          ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}
        `}
      >
        <span className={`truncate ${value ? "text-dark" : "text-slate-500"}`}>
          {value || (disabled ? "Not Available" : placeholder)}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-100 rounded-lg shadow-xl max-h-96 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">
          {/* Search Field */}
          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-md border border-slate-200 focus-within:border-dark/50 transition-colors">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs border border-slate-300 focus:border-dark focus:ring-0 text-dark outline-none placeholder:text-slate-400"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Items List */}
          <ul className="py-1 overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = item === value;
                return (
                  <li
                    key={item}
                    onClick={() => {
                      onChange(item);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                      isSelected
                        ? "bg-slate-50 text-dark font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{item}</span>
                    {isSelected && <Check size={14} className="text-dark" />}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-4 text-center text-xs text-slate-400">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
