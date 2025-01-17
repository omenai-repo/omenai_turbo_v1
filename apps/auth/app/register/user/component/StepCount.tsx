import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import React, { useState } from "react";

const StepCount = () => {
  const { currentSignupFormIndex } = useIndividualAuthStore(); // Current step value

  return (
    <div className="flex items-center space-x-2">
      {/* Render 4 bars */}
      {[0, 1, 2, 3].map((step) => (
        <div
          key={step}
          className={`h-1 w-2 flex-1 rounded ${
            step <= currentSignupFormIndex ? "bg-dark" : "bg-gray-300"
          }`}
        ></div>
      ))}
    </div>
  );
};

export default StepCount;
