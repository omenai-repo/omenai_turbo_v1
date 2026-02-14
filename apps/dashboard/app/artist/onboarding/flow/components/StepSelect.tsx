import React, { useState, useCallback } from "react";
import { CheckCircle, ChevronLeft } from "lucide-react";
import { StepComponentProps } from "../OnboardingContainer";

export default function SelectStep({
  question,
  options = [],
  currentValue,
  updateData,
  goNext,
  goBack,
  isFirstStep,
  label,
}: StepComponentProps) {
  const handleSelect = (value: string) => {
    updateData(label, value.toLowerCase());
    setTimeout(goNext, 600);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg">
      <h2 className="text-fluid-xs font-light text-dark mb-10 text-center">
        {question}
      </h2>

      <div className="w-full space-y-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option)}
            className={`relative font-light transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 text-fluid-xs w-full ring-0 border  p-4 text-left rounded border-dark transition duration-200 flex items-center justify-between shadow-md  ${
              currentValue.toLowerCase() === option.toLowerCase()
                ? "bg-slate-900 text-white shadow-md focus:ring-slate-500"
                : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400 focus:ring-slate-400"
            }`}
          >
            <span className="font-light">{option}</span>
            {currentValue.toLowerCase() === option.toLowerCase() && (
              <CheckCircle className="w-5 h-5 text-white" />
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-start w-full mt-10">
        <button
          onClick={goBack}
          disabled={isFirstStep}
          className="flex items-center text-slate-700 hover:text-gray-700 disabled:opacity-50 transition duration-150"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </button>
      </div>
    </div>
  );
}
