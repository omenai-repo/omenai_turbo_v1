import React, { useState } from "react";

interface InstallationViewsUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export const InstallationViewsUploader = ({
  files,
  onFilesChange,
}: InstallationViewsUploaderProps) => {
  const [error, setError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      let oversizedCount = 0;

      newFiles.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          oversizedCount++;
        } else {
          validFiles.push(file);
        }
      });

      if (oversizedCount > 0) {
        setError(
          `${oversizedCount} file(s) ignored. Max size is 10MB per image.`,
        );
      } else {
        setError(null);
      }

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
      e.target.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    onFilesChange(files.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="mb-12">
      <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-4">
        Installation Views (Optional)
      </label>

      {/* Grid of existing selections + The Dropzone */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="relative aspect-[4/3] bg-neutral-100 rounded-sm border border-neutral-200 overflow-hidden group"
          >
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* The Dropzone */}
        <div
          className={`relative aspect-[4/3] bg-neutral-50 border-2 border-dashed transition-colors flex flex-col items-center justify-center rounded-sm group cursor-pointer ${
            error
              ? "border-red-400 hover:bg-red-50"
              : "border-neutral-300 hover:border-dark hover:bg-neutral-100"
          }`}
        >
          <svg
            className={`w-5 h-5 mb-2 transition-transform duration-300 group-hover:scale-110 ${error ? "text-red-400" : "text-neutral-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span
            className={`text-[10px] font-medium tracking-widest uppercase text-center px-2 ${error ? "text-red-500" : "text-neutral-500 group-hover:text-dark"}`}
          >
            Add Images
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {error && (
        <p className="text-[10px] uppercase tracking-widest text-red-500 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};
