"use client";

import { Input } from "@mantine/core";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { Image as ImageIcon, X } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";

export default function EditorialCover({
  setCover,
  cover,
}: {
  setCover: React.Dispatch<React.SetStateAction<File | null>>;
  cover: File | null;
}) {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const acceptedFileTypes = ["jpg", "jpeg", "png"];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const ext = file.type.split("/")[1];
    if (!acceptedFileTypes.includes(ext)) {
      toast_notif("Unsupported file type. Use JPG or PNG images.", "error");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast_notif("Image must be under 5MB.", "error");
      return;
    }

    setCover(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <Input.Label className="text-sm font-medium text-neutral-900">
        Cover image
      </Input.Label>

      <p className="text-sm text-neutral-500">
        This image will be used as the hero visual for the editorial.
      </p>

      <div
        className="
          relative h-[240px] w-full max-w-xl
          overflow-hidden rounded
          border border-dashed border-neutral-300
          bg-neutral-50
          transition hover:border-neutral-400
        "
      >
        {cover ? (
          <>
            <img
              src={URL.createObjectURL(cover)}
              alt="Editorial cover preview"
              className="h-full w-full object-cover"
            />

            <button
              onClick={() => setCover(null)}
              type="button"
              className="
                absolute right-3 top-3
                rounded bg-white/90 p-1
                text-neutral-600
                shadow-sm
                hover:bg-white
              "
              aria-label="Remove cover image"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => imagePickerRef.current?.click()}
            className="
              flex h-full w-full flex-col items-center justify-center gap-2
              text-neutral-500
              hover:text-neutral-700
            "
          >
            <ImageIcon size={28} />
            <span className="text-sm">Click to upload cover image</span>
            <span className="text-xs text-neutral-400">
              JPG or PNG • max 5MB
            </span>
          </button>
        )}

        <input
          ref={imagePickerRef}
          type="file"
          hidden
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
