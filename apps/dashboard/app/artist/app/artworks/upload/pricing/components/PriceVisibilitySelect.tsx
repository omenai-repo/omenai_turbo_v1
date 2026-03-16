import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import React from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";

interface PriceVisibilitySelectProps {
  shouldShowPrice: "Yes" | "No";
  setShouldShowPrice: (val: "Yes" | "No") => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function PriceVisibilitySelect({
  shouldShowPrice,
  setShouldShowPrice,
  isOpen,
  setIsOpen,
}: PriceVisibilitySelectProps) {
  const { user } = useAuth({ requiredRole: "artist" });
  const NO_CHANGE_VISIBILITY_ACCESS = ["Emerging"];
  const isLocked = NO_CHANGE_VISIBILITY_ACCESS.includes(user.categorization);

  return (
    <div className="bg-white border border-neutral-200 rounded -lg p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-fluid-xs font-medium text-dark">
            Pricing Visibility
          </h3>
          <p className="text-fluid-xxs text-neutral-500 mt-1">
            Control how collectors view the price of this artwork.
          </p>
        </div>
      </div>

      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLocked}
          className={`flex items-center justify-between w-full px-4 py-3 text-sm text-left transition-all border rounded focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent ${
            isLocked
              ? "bg-neutral-50 border-neutral-200 cursor-not-allowed opacity-70"
              : "bg-white border-neutral-300 hover:border-neutral-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {shouldShowPrice === "Yes" ? (
              <Eye size={18} className="text-neutral-500" />
            ) : (
              <EyeOff size={18} className="text-neutral-500" />
            )}
            <span className="font-normal text-dark text-fluid-xxs">
              {shouldShowPrice === "Yes"
                ? "Public: Display price to all users"
                : "Private: Mask price (Inquiries only)"}
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && !isLocked && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-neutral-200 rounded -lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            <button
              type="button"
              onClick={() => {
                setShouldShowPrice("Yes");
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-fluid-xxs font-medium text-dark hover:bg-neutral-50 transition-colors border-b border-neutral-100"
            >
              <Eye size={18} className="text-neutral-400" /> Public: Display
              price to all collectors
            </button>
            <button
              type="button"
              onClick={() => {
                setShouldShowPrice("No");
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-fluid-xxs font-medium text-dark hover:bg-neutral-50 transition-colors"
            >
              <EyeOff size={18} className="text-neutral-400" /> Private: Mask
              price (Inquiries only)
            </button>
          </div>
        )}
        {isLocked && (
          <span className=" italic text-neutral-400 text-[10px] font-normal">
            Pricing visibility unlocked at higher Artist tiers
          </span>
        )}
      </div>
    </div>
  );
}
