"use client";
import { Input, Image } from "@mantine/core";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { Ban } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";

export default function EditorialCover({
  setCover,
  cover,
}: {
  setCover: React.Dispatch<React.SetStateAction<File | null>>;
  cover: File | null;
}) {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const [errorList, setErrorList] = useState<string[]>([]);
  const acceptedFileTypes = ["jpg", "jpeg", "png"];
  const MAX_SIZE_MB = 5; // e.g., 5MB
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if input is actaully an image
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const type = file.type.split("/");

    if (file.size > MAX_SIZE_BYTES) {
      toast_notif("Image file size exceeds the maximum limit of 5MB.", "error");
      return;
    }

    if (!acceptedFileTypes.includes(type[1])) {
      toast_notif(
        "File type unsupported. Supported file types are: JPEG, JPG, and PNG",
        "error"
      );

      return;
    }
    setCover(e.target.files![0]);

    setErrorList([]);
    e.target.value = "";
  };

  return (
    <div>
      <Input.Label className="text-fluid-xxs font-normal">
        Select a cover for this editorial
      </Input.Label>
      <div className="flex flex-col space-y-6 w-full">
        <div className="w-[350px] h-[250px]">
          {cover ? (
            <img
              src={URL.createObjectURL(cover as File)}
              alt="uploaded image"
              width={350}
              height={250}
              className="w-[350px] h-[250px] object-cover object-center mt-2 filter hover:grayscale transition-all duration-200 rounded cursor-not-allowed"
              onClick={() => {
                setCover(null);
              }}
            />
          ) : (
            <button
              type="button"
              className="w-full h-full border text-fluid-xxs grid place-items-center duration-300 border-dark/50 rounded outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
              onClick={() => {
                imagePickerRef.current?.click();
              }}
            >
              <Image className="text-fluid-2xl" />
            </button>
          )}

          <input
            type="file"
            hidden
            ref={imagePickerRef}
            onChange={handleFileChange}
          />
        </div>

        {errorList.length > 0 &&
          errorList.map((error, index) => {
            return (
              <div
                key={`${index}-error_list`}
                className="flex items-center gap-x-2"
              >
                <Ban
                  size={20}
                  color="#ff0000"
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                />
                <p className="text-red-600 text-fluid-xxs">{error}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}
