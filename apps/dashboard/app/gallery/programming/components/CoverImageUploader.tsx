// components/programming/CoverImageUploader.tsx
import React, { useState } from "react";

interface CoverImageUploaderProps {
  currentImageUrl: string;
  error?: string;
  onFileSelect: (file: File) => void;
}

export const CoverImageUploader = ({
  currentImageUrl,
  error,
  onFileSelect,
}: CoverImageUploaderProps) => {
  // NEW: Local error state for file size
  const [sizeError, setSizeError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setSizeError("File exceeds the maximum limit of 10MB.");
      } else {
        setSizeError(null);
        onFileSelect(file);
      }
      // Reset the input value so the same file can trigger onChange again if needed
      e.target.value = "";
    }
  };

  // Determine which error to show (local size error takes priority over parent validation error)
  const displayError = sizeError || error;

  return (
    <div className="mb-12">
      <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-4">
        Event Cover Image
      </label>
      <div
        className={`relative w-full aspect-[21/9] bg-neutral-50 border border-dashed flex flex-col items-center justify-center transition-colors group cursor-pointer overflow-hidden rounded-sm ${
          displayError
            ? "border-red-400 hover:bg-red-50"
            : "border-neutral-300 hover:bg-neutral-100 hover:border-dark"
        }`}
      >
        {currentImageUrl &&
        currentImageUrl !== "https://placeholder.url/image.jpg" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentImageUrl}
            alt="Cover Preview"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <>
            <svg
              className={`w-6 h-6 mb-2 transition-transform duration-300 group-hover:scale-110 ${
                displayError ? "text-red-400" : "text-neutral-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span
              className={`text-[10px] tracking-widest uppercase ${
                displayError
                  ? "text-red-500"
                  : "text-neutral-500 group-hover:text-dark"
              }`}
            >
              Upload Hero Image
            </span>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
      </div>

      {displayError && (
        <p className="text-[10px] uppercase tracking-widest text-red-500 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {displayError}
        </p>
      )}
    </div>
  );
};
