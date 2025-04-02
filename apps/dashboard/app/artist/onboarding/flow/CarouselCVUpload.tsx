"use client";
import { DocumentPlusIcon } from "@heroicons/react/24/solid";
import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import { ArtistOnboardingData } from "@omenai/shared-types";
import React, { ChangeEvent, useRef, useState } from "react";
import { BsFile, BsImage } from "react-icons/bs";
import { toast } from "sonner";

export default function CarouselCVUpload({
  isInteractable,
}: {
  isInteractable: boolean;
}) {
  const [cv, setCv] = useState<File | null>(null);
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const acceptedFileTypes = ["pdf"];

  const { updateOnboardingData, update_field_completion_state } =
    artistOnboardingStore();

  return (
    <div
      className={`${isInteractable ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none"} flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/10 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded-[20px] shadow-md`}
    >
      <div className="w-full">
        <h2 className="text-[14px] font-medium mb-6 text-left">
          Upload your CV
        </h2>
      </div>
      <div className="w-full h-[150px]">
        {cv !== null ? (
          <button
            onClick={() => {
              setCv(null);
              updateOnboardingData("cv" as keyof ArtistOnboardingData, null);
              update_field_completion_state(
                "cv" as keyof ArtistOnboardingData,
                false
              );
            }}
            className="w-full h-full border border-dashed text-[14px] grid place-items-center duration-300 border-dark/20 rounded-[20px] outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
          >
            <span className="break-words">{cv.name.substring(0, 30)}</span>
          </button>
        ) : (
          <button
            type="button"
            className="w-full h-full border border-dashed text-[14px] grid place-items-center duration-300 border-dark/20 rounded-[20px] outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
            onClick={() => {
              imagePickerRef.current?.click();
            }}
          >
            <DocumentPlusIcon className="h-8 w-8" />
          </button>
        )}

        <input
          type="file"
          hidden
          ref={imagePickerRef}
          onChange={(e) => {
            // Check if input is actaully a pdf document
            const type = e.target.files![0].type.split("/");

            if (!acceptedFileTypes.includes(type[1])) {
              toast.error("Error notification", {
                description:
                  "File type is unsupported. Supported file types are: PDF",
                style: {
                  background: "red",
                  color: "white",
                },
                className: "class",
              });
              return;
            } else {
              setCv(e.target.files![0]);
              updateOnboardingData(
                "cv" as keyof ArtistOnboardingData,
                e.target.files![0]
              );
              update_field_completion_state(
                "cv" as keyof ArtistOnboardingData,
                true
              );
              e.target.value = "";
            }
          }}
        />
      </div>
      <p className="text-red-600 text-[12px] mt-5">
        NOTE: Ensure your CV details match the information provided during
        onboarding, as discrepancies may affect verification.
      </p>
    </div>
  );
}
