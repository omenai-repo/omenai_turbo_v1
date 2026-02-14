"use client";
import { galleryActionStore } from "@omenai/shared-state-store/src/gallery/gallery_actions/GalleryActionStore";
import { Camera } from "lucide-react";
import { useState } from "react";

export default function UpdateLogoModalForm() {
  const { logoModalPopup, updateLogoModalPopup } = galleryActionStore();

  return (
    <div className="bg-white rounded max-w-md w-full p-6 shadow-2xl animate-slideUp h-full overflow-y-auto">
      <h3 className="text-fluid-sm font-medium text-dark mb-4">Update Logo</h3>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-line rounded p-8 text-center cursor-pointer hover:border-dark transition-colors duration-300">
          <Camera className="w-12 h-12 text-dark/50 mx-auto mb-3" />
          <p className="text-fluid-xxs text-dark/50 mb-2">
            Drop your image here or click to browse
          </p>
          <p className="text-fluid-xxs text-gray-light">
            PNG, JPG or JPEG up to 5MB
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => updateLogoModalPopup(false)}
            className="flex-1 px-4 py-2.5 bg-gray-300 text-dark rounded hover:bg-gray-400 
                       transition-all duration-300 text-fluid-xxs font-light"
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2.5 bg-dark text-white rounded hover:bg-dark/90 
                             transition-all duration-300 text-fluid-xxs font-light"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
