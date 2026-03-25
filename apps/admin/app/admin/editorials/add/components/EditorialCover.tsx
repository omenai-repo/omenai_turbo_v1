"use client";

import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { Image as ImageIcon, UploadCloud } from "lucide-react";
import React, {
  ChangeEvent,
  useEffect,
  useId,
  useState,
  DragEvent,
} from "react";

export default function EditorialCover({
  setCover,
  cover,
  existingCoverUrl,
}: Readonly<{
  setCover: React.Dispatch<React.SetStateAction<File | null>>;
  cover: File | null;
  existingCoverUrl?: string | null;
}>) {
  const rawId = useId();
  const inputId = `editorial-cover-${rawId}`;
  const [isDragging, setIsDragging] = useState(false);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);

  const MAX_SIZE_BYTES = 15 * 1024 * 1024;

  useEffect(() => {
    if (!cover) {
      setNewPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(cover);
    setNewPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [cover]);

  const validateAndSetFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast_notif("Unsupported file type. Please upload an image.", "error");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast_notif("Image must be under 15MB.", "error");
      return;
    }
    setCover(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    e.target.value = "";
  };

  const onDragOver = (e: DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const displayUrl = newPreviewUrl ?? existingCoverUrl ?? null;

  // Single hidden input shared by both the label click and the Replace button
  const fileInput = (
    <input
      id={inputId}
      type="file"
      accept="image/jpeg, image/png, image/webp"
      className="sr-only"
      onChange={handleFileChange}
    />
  );

  return (
    <div className="flex h-full w-full flex-col">
      {displayUrl ? (
        // Image is present — use a plain div. The only interactive element
        // is a native <label> (Replace Cover), so no a11y warning.
        <div
          className="relative flex h-full min-h-[320px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-transparent transition-all duration-200 ease-in-out"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="group relative h-full w-full">
            <img
              src={displayUrl}
              alt="Editorial cover preview"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {/* Native <label> opens the file picker — fully keyboard & screen-reader accessible */}
              <label
                htmlFor={inputId}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-neutral-900 backdrop-blur-sm transition-transform hover:scale-105 hover:bg-white"
              >
                <UploadCloud size={18} />
                Replace Cover
              </label>
            </div>
          </div>

          {fileInput}
        </div>
      ) : (
        // No image — wrap the entire drop zone in a <label> so clicking
        // anywhere opens the file picker natively. No onClick div needed.
        <label
          htmlFor={inputId}
          className={`
            relative flex h-full min-h-[320px] w-full cursor-pointer flex-col items-center justify-center
            overflow-hidden rounded-xl border-2 transition-all duration-200 ease-in-out
            ${
              isDragging
                ? "border-neutral-400 border-dashed bg-neutral-100/50"
                : "border-dashed border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100/50"
            }
          `}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div
              className={`rounded-full bg-white p-4 shadow-sm ring-1 ring-neutral-900/5 transition-transform duration-300 ${isDragging ? "scale-110 shadow-md" : ""}`}
            >
              <ImageIcon className="text-neutral-400" size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-neutral-900">
                {isDragging ? "Drop image here" : "Upload cover image"}
              </p>
              <p className="text-sm text-neutral-500">
                Drag and drop, or click to browse
              </p>
            </div>
            <p className="text-xs font-medium text-neutral-400 mt-2 uppercase tracking-wider">
              High-Res JPG or PNG. Max 15MB
            </p>
          </div>

          {fileInput}
        </label>
      )}
    </div>
  );
}
