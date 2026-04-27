import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
interface InstallationViewsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUploading: boolean;
  onConfirmUpload: (files: File[]) => Promise<void>;
}

export const InstallationViewsUploadModal = ({
  isOpen,
  onClose,
  isUploading,
  onConfirmUpload,
}: InstallationViewsUploadModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Generate local previews when files change
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Cleanup memory when component unmounts or files change
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      let oversizedCount = 0;

      // Filter files by size
      newFiles.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          oversizedCount++;
        } else {
          validFiles.push(file);
        }
      });

      // Set or clear the error message
      if (oversizedCount > 0) {
        setError(
          `${oversizedCount} file(s) ignored. Maximum size is 10MB per image.`,
        );
      } else {
        setError(null);
      }

      // Only add the valid ones to state
      if (validFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }

      // Reset the input value so the same file can trigger an onChange event again if needed
      e.target.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpload = async () => {
    await onConfirmUpload(selectedFiles);
    setSelectedFiles([]); // Reset after successful upload
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles([]);
      setError(null); // Clear error on close
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-sm shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-normal text-dark">
              Upload Installation Views
            </h2>
            <p className="text-[11px] uppercase tracking-widest text-neutral-500 mt-1">
              Select multiple images to showcase the spatial context.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-neutral-400 hover:text-dark transition-colors disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div>
            {/* Dropzone / Input */}
            <div
              className={`relative w-full h-32 bg-neutral-50 border-2 border-dashed transition-colors flex flex-col items-center justify-center rounded-sm group cursor-pointer ${
                error
                  ? "border-red-400 hover:bg-red-50"
                  : "border-neutral-300 hover:border-dark hover:bg-neutral-100"
              }`}
            >
              <svg
                className={`w-6 h-6 mb-2 transition-transform duration-300 group-hover:scale-110 ${error ? "text-red-400" : "text-neutral-400"}`}
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
                className={`text-xs font-medium tracking-widest uppercase group-hover:text-dark ${error ? "text-red-500" : "text-neutral-500"}`}
              >
                Click to Select Files
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>

            {/* The Error Message */}
            {error && (
              <p className="text-[10px] uppercase tracking-widest text-red-500 mt-3 text-center animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </p>
            )}
          </div>

          {/* Previews Grid */}
          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] bg-neutral-100 rounded-sm border border-neutral-200 overflow-hidden group"
                  >
                    <img
                      src={DOMPurify.sanitize(url)}
                      alt={`Preview ${idx}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Remove Button Overlay */}
                    {!isUploading && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                        <button
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-neutral-100 flex items-center justify-end gap-4 bg-white">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="text-xs font-medium tracking-widest uppercase text-neutral-500 hover:text-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="bg-dark text-white px-8 py-3 text-xs font-medium tracking-widest uppercase hover:bg-neutral-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
          >
            {isUploading
              ? "Uploading images..."
              : `Confirm & Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};
