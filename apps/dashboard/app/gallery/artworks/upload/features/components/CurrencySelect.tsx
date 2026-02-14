"use client";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { SELECT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import { ChangeEvent, useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

// --- Types ---
type ArtworkSelectInputProps = {
  label: string;
  items?: string[] | undefined;
  currency_items?: CurrencyItems[] | undefined;
  name: string;
  required: boolean;
  disabled?: boolean;
};

type CurrencyItems = { name: string; code: string };

// --- Helper: Flag Mapping ---
const getCountryCode = (currencyCode: string): string => {
  const overrides: Record<string, string> = {
    EUR: "eu",
    USD: "us",
    GBP: "gb",
    XOF: "sn",
    XAF: "cm",
    ANG: "an",
    XCD: "ag",
  };
  return overrides[currencyCode] || currencyCode.substring(0, 2).toLowerCase();
};

// --- Sub-Component: Fancy Currency Select ---
export const CurrencySelect = ({
  items,
  value,
  onChange,
  disabled,
}: {
  items: CurrencyItems[];
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const selectedItem = items.find((item) => item.code === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-3.5 bg-white  rounded-md text-sm transition-all duration-200 border border-slate-300 focus:border-dark outline-none focus:ring-0
          ${disabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedItem ? (
            <>
              <img
                src={`https://flagcdn.com/w40/${getCountryCode(selectedItem.code)}.png`}
                alt={selectedItem.code}
                className="w-5 h-auto object-cover rounded-sm shadow-sm"
                loading="lazy"
              />
              <span className="truncate font-medium">{selectedItem.code}</span>
              <span className="truncate text-slate-500 text-xs hidden sm:inline">
                - {selectedItem.name.split("(")[0]}
              </span>
            </>
          ) : (
            <span className="text-slate-500">Select Currency</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* The Dropdown Menu - Positioned Above */}
      {isOpen && (
        // MODIFIED LINE BELOW: Changed mt-1 to bottom-full and mb-1
        <div className="absolute z-50 bottom-full mb-1 w-[300px] bg-white border border-slate-100 rounded-lg shadow-xl max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <ul className="py-1">
            {items.map((item) => {
              const countryCode = getCountryCode(item.code);
              const isSelected = item.code === value;

              return (
                <li
                  key={item.code}
                  onClick={() => {
                    onChange(item.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 cursor-pointer text-sm transition-colors
                    ${isSelected ? "bg-slate-50 text-dark font-medium" : "text-slate-700 hover:bg-slate-50"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://flagcdn.com/w40/${countryCode}.png`}
                      alt={countryCode}
                      className="w-5 h-auto object-cover rounded-sm shadow-sm"
                      loading="lazy"
                    />
                    <div className="flex flex-col">
                      <span className="leading-tight">{item.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.code}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-dark" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
