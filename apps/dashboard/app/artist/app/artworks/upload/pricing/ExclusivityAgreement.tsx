"use client";
import { TriangleAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { base_url } from "@omenai/url-config/src/config";

export default function ExclusivityAgreementGroup({
  priceConsent,
  setPriceConsent,
  acknowledgment,
  setAcknowledgment,
  penaltyConsent,
  setPenaltyConsent,
}: {
  priceConsent: boolean;
  setPriceConsent: (v: boolean) => void;
  acknowledgment: boolean;
  setAcknowledgment: (v: boolean) => void;
  penaltyConsent: boolean;
  setPenaltyConsent: (v: boolean) => void;
}) {
  const totalSteps = 3;
  const currentStep =
    (priceConsent ? 1 : 0) +
    (acknowledgment ? 1 : 0) +
    (penaltyConsent ? 1 : 0);
  const isComplete = currentStep === totalSteps;

  return (
    <div className="w-full mt-2 mb-2">
      <div className="bg-amber-50/50 border border-amber-200 rounded overflow-hidden shadow-sm">
        {/* Compact Header */}
        <div className="bg-amber-100/60 px-4 py-2.5 border-b border-amber-200 flex items-center gap-2">
          <TriangleAlert
            size={16}
            className="text-amber-600 shrink-0"
            strokeWidth={2.5}
          />
          <h3 className="text-amber-900 font-bold text-xs uppercase tracking-wider">
            Exclusivity & Pricing Agreement
          </h3>
        </div>

        {/* Compact Body */}
        <div className="p-3 flex flex-col gap-2">
          <CheckboxCard
            checked={priceConsent}
            onChange={setPriceConsent}
            text="I agree to list this artwork at the finalized listing price"
          />

          <CheckboxCard
            checked={acknowledgment}
            onChange={setAcknowledgment}
            text={
              <span>
                I agree to a 90-day platform exclusivity period where this
                artwork cannot be sold elsewhere. (
                <Link
                  href={`${base_url()}/legal?ent=artist`}
                  target="__blank"
                  className="text-amber-700 underline decoration-amber-400 hover:text-amber-900 font-semibold"
                >
                  Omenai&apos;s Terms of Service
                </Link>
                )
              </span>
            }
          />

          <CheckboxCard
            checked={penaltyConsent}
            onChange={setPenaltyConsent}
            text={
              <span>
                I acknowledge that breaching exclusivity incurs a 10% penalty
                fee on my next platform sale. (
                <Link
                  href={`${base_url()}/legal?ent=artist`}
                  target="__blank"
                  className="text-amber-700 underline decoration-amber-400 hover:text-amber-900 font-semibold"
                >
                  Omenai&apos;s Terms of Service
                </Link>
                )
              </span>
            }
          />
        </div>

        {/* Slim Footer */}
        <div className="px-4 py-2.5 bg-white border-t border-amber-100 flex items-center justify-between">
          <div className="flex gap-1.5 items-center">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1 w-4 rounded -full transition-all duration-300 ${
                  step <= currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <div
            className={`text-[10px] font-bold uppercase tracking-wide transition-colors duration-300 ${
              isComplete ? "text-green-600" : "text-gray-400"
            }`}
          >
            {isComplete ? "All Agreed" : `${currentStep}/${totalSteps}`}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Compact Sub-Component ---
function CheckboxCard({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  text: React.ReactNode;
}) {
  return (
    <label
      className={`relative flex items-start gap-3 p-3 rounded -lg border transition-all duration-200 cursor-pointer group
      ${
        checked
          ? "bg-white border-amber-300 shadow-sm ring-1 ring-amber-100"
          : "bg-white/50 border-transparent hover:bg-white hover:border-amber-200"
      }`}
    >
      <div className="pt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={`h-4 w-4 rounded border flex items-center justify-center transition-all duration-200 
          ${
            checked
              ? "bg-amber-500 border-amber-600 text-white"
              : "bg-white border-gray-300 text-transparent group-hover:border-amber-400"
          }`}
        >
          <CheckCircle2
            size={12}
            strokeWidth={3}
            className={checked ? "scale-100" : "scale-0"}
          />
        </div>
      </div>
      <span
        className={`text-xs leading-snug transition-colors ${
          checked ? "text-gray-900 font-medium" : "text-gray-600"
        }`}
      >
        {text}
      </span>
    </label>
  );
}
