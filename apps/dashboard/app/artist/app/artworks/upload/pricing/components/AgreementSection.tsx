import { ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { base_url } from "@omenai/url-config/src/config";

interface AgreementsProps {
  priceConsent: boolean;
  setPriceConsent: (val: boolean) => void;
  acknowledgment: boolean;
  setAcknowledgment: (val: boolean) => void;
  penaltyConsent: boolean;
  setPenaltyConsent: (val: boolean) => void;
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
}

export default function AgreementsSection({
  priceConsent,
  setPriceConsent,
  acknowledgment,
  setAcknowledgment,
  penaltyConsent,
  setPenaltyConsent,
  currentStep,
  totalSteps,
  isComplete,
}: AgreementsProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded -lg overflow-hidden shadow-sm">
      <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200 flex items-center gap-3">
        <ShieldAlert size={18} className="text-dark" />
        <h3 className="text-dark font-semibold text-sm">Platform Agreements</h3>
      </div>

      <div className="p-5 flex flex-col gap-3">
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
              I acknowledge the 90-day exclusivity period per Omenai's{" "}
              <Link
                href={`${base_url()}/legal?ent=artist`}
                target="__blank"
                className="font-semibold text-dark underline"
              >
                Terms of Use
              </Link>{" "}
              and will not sell this piece externally.
            </span>
          }
        />
        <CheckboxCard
          checked={penaltyConsent}
          onChange={setPenaltyConsent}
          text="I accept that a breach of exclusivity incurs a 10% penalty on my next platform sale."
        />
      </div>

      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 w-6 rounded -full transition-colors ${step <= currentStep ? "bg-dark" : "bg-neutral-200"}`}
            />
          ))}
        </div>
        <span
          className={`text-xs font-bold ${isComplete ? "text-dark" : "text-neutral-400"}`}
        >
          {currentStep}/{totalSteps} Completed
        </span>
      </div>
    </div>
  );
}

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
      className={`flex items-start gap-3 p-3 rounded -xl border transition-all cursor-pointer select-none ${
        checked
          ? "bg-neutral-50 border-dark"
          : "bg-white border-neutral-200 hover:border-neutral-300"
      }`}
    >
      <div className="pt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`h-5 w-5 rounded -md border flex items-center justify-center transition-all ${
            checked
              ? "bg-dark border-dark text-white"
              : "bg-white border-neutral-300 text-transparent"
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
        className={`text-xs leading-relaxed ${checked ? "text-dark font-medium" : "text-neutral-500"}`}
      >
        {text}
      </span>
    </label>
  );
}
