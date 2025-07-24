"use client";
/* eslint-disable @next/next/no-img-element */
import { FormEvent, useContext, useRef, useState } from "react";
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

export default function UploadArtworkImage() {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const { image, setImage, artworkUploadData, clearData } =
    galleryArtworkUploadStore();
  const [loading, setLoading] = useState(false);
  const { user, csrf } = useAuth({ requiredRole: "gallery" });
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const handleArtworkUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!image) {
      toast.error("Error notification", {
        description: "Please select an image",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      setLoading(false);
      return;
    }

    const fileType = image.type.split("/")[1];
    if (!acceptedFileTypes.includes(fileType)) {
      toast.error("Error notification", {
        description:
          "File type unsupported. Supported file types are: JPEG, JPG, and PNG",
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
      const data = createUploadedArtworkData(
        artworkUploadData,
        file.fileId,
        user.gallery_id ?? "",
        {
          role: "gallery",
          designation: null,
        }
      );

      const uploadResponse = await uploadArtworkData(data, csrf || "");

      if (!uploadResponse?.isOk) {
        await storage.deleteFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          file.fileId
        );
        toast.error("Error notification", {
          description: uploadResponse?.body.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        setImage(null);
        return;
      }

      toast.success("Operation successful", {
        description: uploadResponse.body.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      queryClient.invalidateQueries();
      clearData();
      router.replace("/gallery/artworks");
    } catch (error) {
      console.error("Error uploading artwork:", error);
      toast.error("Error notification", {
        description:
          "An error occurred while uploading the artwork. Please try again.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleArtworkUpload}>
      <div className="w-full h-[60vh] grid place-items-center">
        {image ? (
          <img
            src={URL.createObjectURL(image)}
            alt="uploaded image"
            className="w-auto h-auto max-h-[50vh] max-w-full object-cover mt-2 filter hover:grayscale transition-all duration-200 rounded-lg cursor-not-allowed"
            onClick={() => {
              setImage(null);
            }}
          />
        ) : (
          <button
            type="button"
            className="w-[400px] h-[400px] border border-[#E0E0E0] bg-white rounded-md text-fluid-xs outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
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
      <div className="mt-10 flex justify-center w-full text-fluid-xs">
        <button
          disabled={loading || !image}
          className={`h-[35px] p-5 rounded-xl w-fit flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] bg-dark text-white text-fluid-xs font-normal`}
          type="submit"
        >
          {loading ? <LoadSmall /> : "Upload artwork"}
        </button>
      </div>
    </form>
  );
}
