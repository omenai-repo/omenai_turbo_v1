import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { BUTTON_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import WarningAlert from "./WarningAlert";
import { Check, Lock } from "lucide-react";

interface TermsAndSubmitSectionProps {
  termsChecked: boolean;
  onTermsChange: (checked: boolean) => void;
  loading: boolean;
  isDisabled: boolean;
  isExclusive: boolean;
}

export default function TermsAndSubmitSection({
  termsChecked,
  onTermsChange,
  loading,
  isDisabled,
  isExclusive,
}: TermsAndSubmitSectionProps) {
  return (
    <div className="space-y-6 pt-2 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!isExclusive && <WarningAlert />}

      {/* Custom Interactive Terms Card */}
      <label
        className={`
          relative flex items-start gap-4 p-5 rounded border transition-all cursor-pointer select-none group
          ${
            termsChecked
              ? "bg-slate-50 border-dark ring-1 ring-dark shadow-sm"
              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
          }
        `}
      >
        {/* Accessible Hidden Input */}
        <input
          type="checkbox"
          checked={termsChecked}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="sr-only"
        />

        {/* Custom Visual Checkbox */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`
              w-6 h-6 rounded flex items-center justify-center transition-all duration-200
              ${
                termsChecked
                  ? "bg-dark text-white border-dark"
                  : "bg-white border-2 border-slate-300 group-hover:border-slate-400 text-transparent"
              }
            `}
          >
            <Check strokeWidth={3} className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 text-sm">
          <p
            className={`font-bold tracking-tight mb-1 transition-colors ${termsChecked ? "text-slate-900" : "text-slate-700"}`}
          >
            Acknowledge Terms & Dimensions
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            I confirm the dimensions provided are strictly accurate, and the
            artwork is properly packed and ready for processing.
          </p>
        </div>
      </label>

      {/* Dynamic Submit Button */}
      <button
        type="submit"
        disabled={isDisabled}
        className={`
          ${BUTTON_CLASS} 
          w-full py-3.5 text-fluid-xs font-normal tracking-wide rounded transition-all duration-300 flex items-center justify-center gap-2
          ${
            isDisabled && !loading
              ? "!bg-slate-100 !text-slate-400 !border-slate-200 shadow-none cursor-not-allowed"
              : ""
          }
        `}
      >
        {loading ? (
          <LoadSmall />
        ) : isDisabled ? (
          <>
            <Lock className="w-4 h-4" />
            <span>Complete required fields to Accept</span>
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            <span>Accept & Confirm Order</span>
          </>
        )}
      </button>
    </div>
  );
}
