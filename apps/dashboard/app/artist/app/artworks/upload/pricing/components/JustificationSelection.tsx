import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JustificationType } from "@omenai/shared-types";
import {
  INPUT_CLASS,
  SELECT_CLASS,
  TEXTAREA_CLASS,
} from "@omenai/shared-ui-components/components/styles/inputClasses";
import {
  Link as LinkIcon,
  UploadCloud,
  FileText,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";

interface JustificationSectionProps {
  justificationType: JustificationType | "";
  setJustificationType: (val: JustificationType) => void;
  justificationUrl: string;
  setJustificationUrl: (val: string) => void;
  justificationFile: File | null;
  setJustificationFile: (val: File | null) => void;
  justificationNotes: string;
  setJustificationNotes: (val: string) => void;
}

export default function JustificationSection({
  justificationType,
  setJustificationType,
  justificationUrl,
  setJustificationUrl,
  justificationFile,
  setJustificationFile,
  justificationNotes,
  setJustificationNotes,
}: JustificationSectionProps) {
  // Local state to toggle between proof formats
  const [proofFormat, setProofFormat] = useState<"LINK" | "DOCUMENT">(
    "DOCUMENT",
  );

  // 1. Add state and ref for the custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. Close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const justificationOptions: { label: string; value: JustificationType }[] = [
    { label: "Past Sale of Similar Work", value: "PAST_SALE" },
    { label: "Part of Gallery Exhibition", value: "GALLERY_EXHIBITION" },
    { label: "Other", value: "OTHER" },
  ];

  const currentLabel =
    justificationOptions.find((opt) => opt.value === justificationType)
      ?.label || "Select your proof of value...";
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-5 border-t border-neutral-200 pt-5 mt-2"
    >
      {/* 1. Justification Type */}
      <div className="flex flex-col gap-2" ref={dropdownRef}>
        <label className="text-sm font-bold text-dark">
          Data Source / Justification
        </label>

        <div className="relative w-full">
          {/* Custom Select Trigger */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between w-full bg-white border-0 ring-1 ring-neutral-200 px-4 py-3.5 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-dark focus:border-0 rounded ${
              isDropdownOpen
                ? "ring-dark shadow-sm"
                : "ring-neutral-300 hover:border-neutral-400"
            }`}
          >
            <span
              className={
                justificationType ? "text-dark font-medium" : "text-neutral-400"
              }
            >
              {currentLabel}
            </span>
            <ChevronDown
              size={18}
              className={`text-neutral-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-dark" : ""}`}
            />
          </button>

          {/* Animated Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute z-50 w-full mt-2 bg-white border-0 ring-1 ring-neutral-200 rounded outline-none overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto py-1">
                  {justificationOptions.map((option) => {
                    const isSelected = justificationType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setJustificationType(option.value);
                          // Reset proofs when changing type (matching your original logic)
                          setJustificationUrl("");
                          setJustificationFile(null);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                          isSelected
                            ? "bg-neutral-50 text-dark font-semibold"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-dark font-medium"
                        }`}
                      >
                        {option.label}
                        {isSelected && (
                          <Check size={16} className="text-dark" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Dynamic Proof Input (Link or File) */}
      <AnimatePresence>
        {(justificationType === "PAST_SALE" ||
          justificationType === "GALLERY_EXHIBITION") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            <label className="text-sm font-bold text-dark">
              Verification Format <span className="text-red-500">*</span>
            </label>

            {/* Toggle Switch */}
            <div className="flex p-1 bg-neutral-100 rounded-lg border border-neutral-200 w-full">
              <button
                type="button"
                onClick={() => setProofFormat("DOCUMENT")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                  proofFormat === "DOCUMENT"
                    ? "bg-white text-dark shadow-sm"
                    : "text-neutral-500 hover:text-dark"
                }`}
              >
                <UploadCloud size={16} /> Document
              </button>
              <button
                type="button"
                onClick={() => setProofFormat("LINK")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                  proofFormat === "LINK"
                    ? "bg-white text-dark shadow-sm"
                    : "text-neutral-500 hover:text-dark"
                }`}
              >
                <LinkIcon size={16} /> URL Link
              </button>
            </div>

            {/* Input Areas */}
            <div className="mt-1">
              {proofFormat === "LINK" ? (
                <input
                  type="url"
                  value={justificationUrl}
                  onChange={(e) => {
                    setJustificationUrl(e.target.value);
                    if (justificationFile) setJustificationFile(null); // Clear file if they switch to URL
                  }}
                  placeholder="e.g. https://example_url.com/your-piece"
                  className={`${INPUT_CLASS} bg-white border-neutral-300 py-3.5`}
                  required={proofFormat === "LINK"}
                />
              ) : (
                <div
                  className={`relative w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                    justificationFile
                      ? "border-dark bg-neutral-50"
                      : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 cursor-pointer"
                  }`}
                >
                  {/* Hidden file input stretching over the whole box */}
                  {!justificationFile && (
                    <input
                      type="file"
                      accept=".pdf" // Changed to only accept PDF natively in the file browser
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file type
                          if (file.type !== "application/pdf") {
                            toast_notif(
                              "Invalid file type. Please upload a PDF document.",
                              "error",
                            );
                            e.target.value = "";
                            return;
                          }

                          setJustificationFile(file);
                          setJustificationUrl("");
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required={
                        proofFormat === "DOCUMENT" && !justificationFile
                      }
                    />
                  )}

                  {justificationFile ? (
                    <div className="flex flex-col items-center gap-2 z-20">
                      <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center text-dark">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm font-bold text-dark truncate max-w-[250px]">
                        {justificationFile.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {(justificationFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setJustificationFile(null)}
                        className="mt-2 flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        <X size={14} /> Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 mb-1">
                        <UploadCloud size={20} />
                      </div>
                      <p className="text-sm font-semibold text-dark">
                        Click to upload a document
                      </p>
                      <p className="text-xs text-neutral-500">
                        PDF, DOCX, JPG, or PNG (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Contextual Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-dark">Contextual Notes</label>
        <textarea
          value={justificationNotes}
          onChange={(e) => setJustificationNotes(e.target.value)}
          placeholder="Help our review team understand the price change..."
          rows={3}
          required
          className={`${TEXTAREA_CLASS} bg-white border-neutral-300 resize-none`}
        />
      </div>
    </motion.div>
  );
}
