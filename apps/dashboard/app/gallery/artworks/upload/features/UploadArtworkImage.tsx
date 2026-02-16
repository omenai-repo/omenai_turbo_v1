"use client";
/* eslint-disable @next/next/no-img-element */
import { FormEvent, useRef, useState } from "react";
import uploadImage from "@omenai/shared-services/artworks/uploadArtworkImage";
import { createUploadedArtworkData } from "@omenai/shared-utils/src/createUploadedArtworkData";
import { uploadArtworkData } from "@omenai/shared-services/artworks/uploadArtworkData";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { storage } from "@omenai/appwrite-config";

import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useRollbar } from "@rollbar/react";
import { Radio, Group, Text, Stack } from "@mantine/core";
import { BUTTON_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";

export default function UploadArtworkImage() {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const {
    image,
    setImage,
    artworkUploadData,
    updateArtworkUploadData,
    clearData,
  } = galleryArtworkUploadStore();

  // New State for Packaging Type
  const [packagingType, setPackagingType] = useState<"stretched" | "rolled">(
    "stretched",
  );

  const [loading, setLoading] = useState(false);
  const rollbar = useRollbar();
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const router = useRouter();
  const queryClient = useQueryClient();

  // Accepted types should match standard MIME types parts
  const acceptedFileTypes = ["jpg", "jpeg", "png", "webp"];

  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict MIME type check
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file.",
      });
      return;
    }

    // Size Validation
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File too large", {
        description: `Image file size exceeds the maximum limit of ${MAX_SIZE_MB}MB.`,
        style: { background: "red", color: "white" },
      });
      return;
    }

    // Extension/Subtype Validation
    const type = file.type.split("/")[1];
    if (!acceptedFileTypes.includes(type)) {
      toast.error("Unsupported format", {
        description: "Supported file types are: JPEG, JPG, PNG, and WEBP",
        style: { background: "red", color: "white" },
      });
      return;
    }

    setImage(file);
    e.target.value = ""; // Reset input
  };

  const handleArtworkUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!image) {
      toast.error("Missing Image", {
        description: "Please select an image before uploading.",
        style: { background: "red", color: "white" },
      });
      setLoading(false);
      return;
    }

    try {
      const fileUploaded = await uploadImage(image);

      if (!fileUploaded) {
        throw new Error("Image upload failed");
      }

      const file = {
        bucketId: fileUploaded.bucketId,
        fileId: fileUploaded.$id,
      };

      // Create base data
      const baseData = createUploadedArtworkData(
        artworkUploadData,
        file.fileId,
        user.gallery_id ?? "",
        {
          role: "gallery",
          designation: null,
        },
      );

      console.log(baseData);

      const uploadResponse = await uploadArtworkData(baseData, csrf || "");

      if (!uploadResponse?.isOk) {
        await storage.deleteFile({
          bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          fileId: file.fileId,
        });
        toast.error("Upload Error", {
          description: uploadResponse?.body.message,
          style: { background: "red", color: "white" },
        });
        setImage(null);
        return;
      }

      toast.success("Success", {
        description: "Artwork uploaded successfully",
        style: { background: "green", color: "white" },
      });

      queryClient.invalidateQueries();
      clearData();
      router.replace("/gallery/artworks");
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
      console.error("Error uploading artwork:", error);
      toast.error("System Error", {
        description:
          "An error occurred while uploading the artwork. Please try again.",
        style: { background: "red", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleArtworkUpload}
      className="w-full max-w-4xl mx-auto grid place-items-center"
    >
      {/* 1. Image Upload Section */}
      <div className="w-full grid place-items-center mb-5">
        {image ? (
          <button
            type="button"
            onClick={() => setImage(null)}
            className="relative group"
          >
            <img
              src={URL.createObjectURL(image)}
              alt="uploaded artwork"
              className="w-auto h-auto max-h-[300px] max-w-full object-contain rounded shadow-lg transition-all duration-200"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity cursor-pointer text-white font-medium">
              Click to Remove
            </div>
          </button>
        ) : (
          <button
            type="button"
            className="w-full max-w-[300px] aspect-square border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl flex flex-col items-center justify-center p-8 hover:border-dark hover:bg-slate-100 transition-all group"
            onClick={() => imagePickerRef.current?.click()}
          >
            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-slate-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-900">
              Click to upload artwork image
            </span>
            <span className="text-xs text-slate-500 mt-2 text-center max-w-xs">
              Supports JPG, JPEG, PNG (Max 5MB). High resolution recommended.
            </span>
          </button>
        )}
        <input
          type="file"
          hidden
          ref={imagePickerRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.webp"
        />
      </div>

      {/* 2. Shipping Configuration Section */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 mb-10 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Shipping Configuration
        </h3>

        {/* Helper Diagram for Context */}
        <div className="mb-4"></div>

        <Radio.Group
          value={artworkUploadData.packaging_type}
          onChange={(val) =>
            updateArtworkUploadData(
              "packaging_type",
              val as "stretched" | "rolled",
            )
          }
          name="packagingType"
        >
          <Group align="flex-start">
            <Radio
              value="stretched"
              label={
                <div className="ml-1">
                  <Text size="sm" fw={500} c="dark">
                    Stretched
                  </Text>
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ maxWidth: "300px", lineHeight: "1.4" }}
                  >
                    The canvas is stretched. It should be packaged in a
                    cardboard box.
                  </Text>
                </div>
              }
              className="p-4 border cursor-pointer border-slate-200 rounded-md hover:bg-slate-50 flex-1 transition-colors"
              styles={{
                root: { alignItems: "flex-start" },
                radio: { cursor: "pointer" },
              }}
            />

            <Radio
              value="rolled"
              label={
                <div className="ml-1">
                  <Text size="sm" fw={500} c="dark">
                    Rolled (Tube)
                  </Text>
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ maxWidth: "300px", lineHeight: "1.4" }}
                  >
                    The canvas is rolled into a tube. Lower shipping costs via
                    standard carriers.
                  </Text>
                </div>
              }
              className="p-4 border cursor-pointer border-slate-200 rounded-md hover:bg-slate-50 flex-1 transition-colors"
              styles={{
                root: { alignItems: "flex-start" },
                radio: { cursor: "pointer" },
              }}
            />
          </Group>
        </Radio.Group>
      </div>

      {/* 3. Submit Action */}
      <div className="flex justify-center w-full max-w-lg">
        <button
          disabled={loading || !image}
          className={BUTTON_CLASS}
          type="submit"
        >
          {loading ? <LoadSmall /> : "Upload Artwork"}
        </button>
      </div>
    </form>
  );
}
