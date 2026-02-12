import React, { useState, useCallback } from "react";

export default function StepWrapper({
  currentStepIndex,
  totalSteps,
  children,
}: {
  currentStepIndex: number;
  totalSteps: number;
  children: React.ReactNode;
}) {
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div className="w-full max-w-2xl p-4 sm:p-8 relative z-10">
      <div className="mb-12">
        <div className="text-fluid-xs font-light text-dark mb-2">
          Question {currentStepIndex + 1} of {totalSteps}
        </div>
        <div className="w-full bg-slate-200 rounded h-2.5">
          <div
            className="bg-dark h-2.5 rounded transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      {/* Step Content Card */}
      <div className="w-full bg-white p-5 sm:p-10 rounded shadow transition-all duration-500 min-h-[400px] flex flex-col justify-center items-center">
        {children}
      </div>
    </div>
  );
}
