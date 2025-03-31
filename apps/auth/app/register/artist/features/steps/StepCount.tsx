import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";
import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import React, { useState } from "react";

const StepCount = () => {
  const { currentArtistSignupFormIndex } = useArtistAuthStore(); // Current step value

  return (
    <div className="flex items-center space-x-2">
      {/* Render 5 bars */}
      {[0, 1, 2, 3, 4, 5].map((step) => (
        <div
          key={step}
          className={`h-1 w-2 flex-1 rounded ${
            step <= currentArtistSignupFormIndex ? "bg-dark" : "bg-gray-300"
          }`}
        ></div>
      ))}
    </div>
  );
};

export default StepCount;
