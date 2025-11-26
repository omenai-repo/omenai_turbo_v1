"use client";
import { Upload, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { StepComponentProps } from "../OnboardingContainer";
import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { ArtistOnboardingData } from "@omenai/shared-types";

export default function CVUploadStep({
  question,
  updateData,
  goNext,
  goBack,
  isFirstStep,
  label,
  currentValue,
}: StepComponentProps) {
  const [cv, setCv] = useState<File | null>(currentValue);
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const acceptedFileTypes = ["pdf"];
  const handleUpload = () => {
    imagePickerRef.current?.click();
    updateData(label, cv);
  };

  const { updateOnboardingData } = artistOnboardingStore();

  const isReady = cv !== null;

  return (
    <div className="flex flex-col items-center">
      <Upload className="w-12 h-12 text-blue-500 mb-6" />
      <h2 className="text-fluid-xs font-normal text-dark mb-4 text-center">
        {question}
      </h2>
      <button
        onClick={handleUpload}
        className={`w-full max-w-md text-fluid-xs flex items-center justify-center p-3 rounded transition duration-300 shadow-md ${
          isReady
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-white border-2 border-dashed border-gray-300 hover:border-dark text-slate-800"
        }`}
      >
        {isReady ? (
          <>
            <CheckCircle className="w-5 h-5 mr-2" /> File Added:{" "}
            {cv.name.substring(0, 20)}...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" /> Click to Select File (PDF)
          </>
        )}
      </button>
      <input
        type="file"
        hidden
        ref={imagePickerRef}
        onChange={(e) => {
          // Check if input is actaully a pdf document
          const type = e.target.files![0].type.split("/");

          if (!acceptedFileTypes.includes(type[1])) {
            toast_notif(
              "File type is unsupported. Supported file types are: PDF",
              "error"
            );
            return;
          } else {
            setCv(e.target.files![0]);
            updateOnboardingData(
              "cv" as keyof ArtistOnboardingData,
              e.target.files![0]
            );
            e.target.value = "";
          }
        }}
      />
      <div className="flex justify-between w-full max-w-sm mt-8">
        <button
          onClick={goBack}
          disabled={isFirstStep}
          className="flex items-center text-slate-700 hover:text-gray-700 disabled:opacity-50 transition duration-150"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </button>
        <button
          onClick={goNext}
          disabled={!isReady}
          className={`px-4 py-2 rounded text-fluid-xs text-white font-medium transition duration-300 ${
            isReady
              ? "bg-dark shadow-lg hover:shadow-xl"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Next <ChevronRight className="w-5 h-5 ml-1 inline-block" />
        </button>
      </div>
    </div>
  );
}
