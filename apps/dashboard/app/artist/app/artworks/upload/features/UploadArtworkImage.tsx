"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";

import { artistArtworkUploadStore } from "@omenai/shared-state-store/src/artist/artwork_upload/artistArtworkUpload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UploadArtworkImage() {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const { image, setImage } = artistArtworkUploadStore();
  const router = useRouter();
  const acceptedFileTypes = ["jpg", "jpeg", "png"];

  const MAX_SIZE_MB = 5; // e.g., 5MB
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if input is actaully an image
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const type = file.type.split("/");

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Error notification", {
        description: "Image file size exceeds the maximum limit of 5MB.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }

    if (!acceptedFileTypes.includes(type[1])) {
      toast.error("Error notification", {
        description:
          "File type unsupported. Supported file types are: JPEG, JPG, and PNG",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }
    setImage(file);
    e.target.value = ""; // Reset the input value to allow re-uploading the same file
  };

  function handleImageSubmit() {
    if (image === null)
      toast.error("Error notification", {
        description: "Please upload your artwork before proceeding",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else {
      const fileType = image.type.split("/")[1];
      if (!acceptedFileTypes.includes(fileType)) {
        toast.error("Error notification", {
          description:
            "File type unsupported. Supported file types are: JPEG, JPG, and PNG",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }
      toast.info("Operation in progress", {
        description: "Processing, please wait",
      });
      router.push("/artist/app/artworks/upload/pricing");
    }
  }

  return (
    <div>
      <div className="w-full h-[60vh] grid place-items-center">
        {image ? (
          <img
            role="button"
            src={URL.createObjectURL(image)}
            alt="uploaded artwork"
            className="w-auto h-auto max-h-[50vh] max-w-full object-cover mt-2 filter hover:grayscale transition-all duration-200 rounded cursor-not-allowed"
            onClick={() => {
              setImage(null);
            }}
          />
        ) : (
          <button
            type="button"
            className="w-[400px] h-[400px] border border-[#E0E0E0] bg-white rounded text-fluid-xxs outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
            onClick={() => {
              imagePickerRef.current?.click();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mr-2 inline-block"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="">Upload your artpiece</span>
            <div className="flex flex-col items-center mt-8 space-y-2">
              <span className=" text-fluid-xxs">
                <strong>5MB</strong> MAX SIZE allowed
              </span>
              <span className="text-fluid-xxs">
                Allowed formats: JPEG, JPG and PNG
              </span>
            </div>
          </button>
        )}

        <input
          type="file"
          hidden
          ref={imagePickerRef}
          onChange={handleFileChange}
        />
      </div>
      <div className="mt-4 flex w-full text-fluid-xxs justify-center">
        <button
          onClick={handleImageSubmit}
          type="button"
          className={`h-[35px] p-5 rounded w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xxs font-normal`}
        >
          Calculate artwork price
        </button>
      </div>
    </div>
  );
}
