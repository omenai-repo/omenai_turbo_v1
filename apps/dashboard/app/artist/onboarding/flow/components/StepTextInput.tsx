import { ChevronLeft, ChevronRight } from "lucide-react";
import { StepComponentProps } from "../OnboardingContainer";
import {
  INPUT_CLASS,
  TEXTAREA_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";
import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import React from "react";

export default function TextStep({
  question,
  label,
  currentValue,
  updateData,
  goNext,
  goBack,
  isFirstStep,
  placeholder,
}: StepComponentProps) {
  const isBio = label === "bio";

  const isExhibitionCount = label === "solo" || label === "group";

  const isReady =
    typeof currentValue === "string" && currentValue.trim().length > 0;

  const isValueTextString = typeof currentValue === "string";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const strippedValue = e.target.value.replace(/^0+/, "");

    updateData(label, strippedValue);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl">
      <h2 className="text-fluid-xs font-light text-slate-800 mb-8 text-center">
        {question}
      </h2>
      {isBio ? (
        <textarea
          rows={5}
          maxLength={500}
          value={isValueTextString ? currentValue : ""}
          onChange={handleChange}
          placeholder={placeholder || "Start typing your bio..."}
          className={TEXTAREA_CLASS}
        />
      ) : (
        <input
          type={isExhibitionCount ? "number" : "text"}
          min={isExhibitionCount ? 0 : undefined}
          value={isValueTextString ? currentValue : ""}
          onChange={handleChange}
          placeholder={placeholder || "Enter your response"}
          className={INPUT_CLASS}
        />
      )}
      {isBio && (
        <p className="text-fluid-xs text-slate-700 mt-2 self-end">
          {isValueTextString && currentValue.length} / 500 characters
        </p>
      )}

      <div className="flex justify-between w-full mt-10">
        <button
          onClick={goBack}
          disabled={isFirstStep}
          className="flex items-center text-slate-700 hover:text-gray-700 disabled:opacity-50 transition duration-150"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </button>
        <button
          onClick={goNext}
          disabled={!isReady}
          className={`px-4 py-2 rounded text-fluid-xs text-white font-medium transition duration-300 ${
            isReady
              ? "bg-dark shadow-lg hover:shadow-xl"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Next <ChevronRight className="w-5 h-5 ml-1 inline-block" />
        </button>
      </div>
    </div>
  );
}
