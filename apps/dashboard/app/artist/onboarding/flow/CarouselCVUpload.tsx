"use client";
import { DocumentPlusIcon } from "@heroicons/react/24/solid";
import React, { useRef, useState } from "react";
import { BsFile, BsImage } from "react-icons/bs";
import { toast } from "sonner";

export default function CarouselCVUpload() {
  const [cv, setCv] = useState<File | null>(null);

  const imagePickerRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = ["pdf"];
  return (
    <div className="flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/10 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded-[20px] shadow-md">
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
            }}
            className="w-full h-full border border-dashed text-[14px] grid place-items-center duration-300 border-dark/20 rounded-[20px] outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
          >
            <span>{cv.name}</span>
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
            // Check if input is actaully an image
            console.log(e.target.files);
            const type = e.target.files![0].type.split("/");

            if (!acceptedFileTypes.includes(type[1])) {
              toast.error("Error notification", {
                description:
                  "File type unsupported. Supported file types are: PDF",
                style: {
                  background: "red",
                  color: "white",
                },
                className: "class",
              });
              return;
            } else {
              setCv(e.target.files![0]);
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
