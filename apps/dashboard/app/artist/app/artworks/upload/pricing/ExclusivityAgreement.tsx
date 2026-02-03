"use client";
import { TriangleAlert, CheckCircle2, Circle } from "lucide-react";
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
  // Calculate progress for the visual indicator
  const totalSteps = 3;
  const currentStep =
    (priceConsent ? 1 : 0) +
    (acknowledgment ? 1 : 0) +
    (penaltyConsent ? 1 : 0);
  const isComplete = currentStep === totalSteps;

  return (
    <div className="my-8 w-full max-w-3xl mx-auto">
      {/* Main Container */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header Section */}
        <div className="bg-amber-100/60 px-6 py-4 border-b border-amber-200 flex items-start sm:items-center gap-3">
          <div className="p-2 bg-amber-200 text-amber-700 rounded-lg shrink-0">
            <TriangleAlert size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-amber-900 font-semibold text-sm sm:text-base">
              Exclusivity & Pricing Agreement
            </h3>
            <p className="text-amber-800/70 text-xs mt-0.5">
              Please review and accept the terms below to proceed with your
              upload.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Checkbox Item 1 */}
          <CheckboxCard
            checked={priceConsent}
            onChange={setPriceConsent}
            text="I accept the price stipulated for this artwork and agree to have it listed on the platform at this price. I understand that I may cancel this upload if I do not agree."
          />

          {/* Checkbox Item 2 */}
          <CheckboxCard
            checked={acknowledgment}
            onChange={setAcknowledgment}
            text={
              <span>
                I acknowledge that this artwork is subject to a 90-day
                exclusivity period with Omenai as stipulated in the{" "}
                <Link
                  href={`${base_url()}/legal?ent=artist`}
                  target="__blank"
                  className="text-amber-700 underline decoration-amber-400 underline-offset-2 hover:text-amber-900 font-medium transition-colors"
                >
                  Terms of Agreement
                </Link>{" "}
                and may not be sold through external channels during this time.
              </span>
            }
          />

          {/* Checkbox Item 3 */}
          <CheckboxCard
            checked={penaltyConsent}
            onChange={setPenaltyConsent}
            text={
              <span>
                I agree that any breach of this exclusivity obligation will
                result in a 10% penalty fee deducted from my next successful
                sale on the platform as stipulated in the{" "}
                <Link
                  href={`${base_url()}/legal?ent=artist`}
                  target="__blank"
                  className="text-amber-700 underline decoration-amber-400 underline-offset-2 hover:text-amber-900 font-medium transition-colors"
                >
                  Terms of Agreement.
                </Link>
              </span>
            }
          />
        </div>

        {/* Footer / Status Bar */}
        <div className="px-6 py-3 bg-white border-t border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span>Completion Status:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 w-6 rounded-full transition-all duration-300 ${step <= currentStep ? "bg-green-500" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>
          <div
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-300 ${isComplete ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {isComplete ? "All Agreed" : `${currentStep}/${totalSteps} Agreed`}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Component for Cleaner Code ---
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
      className={`relative flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer group
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
          className="peer sr-only" // Hide default checkbox
        />
        {/* Custom Checkbox UI */}
        <div
          className={`h-5 w-5 rounded border flex items-center justify-center transition-all duration-200 
          ${
            checked
              ? "bg-amber-500 border-amber-600 text-white"
              : "bg-white border-gray-300 text-transparent group-hover:border-amber-400"
          }`}
        >
          <CheckCircle2
            size={14}
            strokeWidth={3}
            className={checked ? "scale-100" : "scale-0"}
          />
        </div>
      </div>
      <span
        className={`text-sm leading-relaxed transition-colors ${checked ? "text-gray-800" : "text-gray-600"}`}
      >
        {text}
      </span>
    </label>
  );
}
