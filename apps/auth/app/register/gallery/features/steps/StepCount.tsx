import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import React, { useState } from "react";

const StepCount = () => {
  const { currentGallerySignupFormIndex } = useGalleryAuthStore(); // Current step value

  return (
    <div className="flex items-center space-x-2">
      {/* Render 5 bars */}
      {[0, 1, 2, 3, 4].map((step) => (
        <div
          key={step}
          className={`h-1 w-2 flex-1 rounded ${
            step <= currentGallerySignupFormIndex ? "bg-dark" : "bg-gray-300"
          }`}
        ></div>
      ))}
    </div>
  );
};

export default StepCount;
