"use client";
/* eslint-disable @next/next/no-img-element */
import { FormEvent, useContext, useRef, useState } from "react";
import Image from "next/image";
import uploadImage from "@omenai/shared-services/artworks/uploadArtworkImage";
import { createUploadedArtworkData } from "@omenai/shared-utils/src/createUploadedArtworkData";
import { uploadArtworkData } from "@omenai/shared-services/artworks/uploadArtworkData";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { storage } from "@omenai/appwrite-config";
import {
  SessionContext,
  useSession,
} from "@omenai/package-provider/SessionProvider";
import { galleryArtworkUploadStore } from "@omenai/shared-state-store/src/gallery/gallery_artwork_upload/GalleryArtworkUpload";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";

export default function UploadArtworkImage() {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const { image, setImage, artworkUploadData, clearData } =
    galleryArtworkUploadStore();
  const [loading, setLoading] = useState(false);
  const { session } = useContext(SessionContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const acceptedFileTypes = ["jpg", "jpeg", "png"];

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
        (session?.gallery_id as string) ?? ""
      );

      const uploadResponse = await uploadArtworkData(data);

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
            className="w-auto h-auto max-h-[60vh] max-w-full object-cover mt-2 filter hover:grayscale transition-all duration-200 rounded-lg cursor-not-allowed"
            onClick={() => {
              setImage(null);
            }}
          />
        ) : (
          <button
            type="button"
            className="w-[400px] h-[400px] border border-[#E0E0E0] bg-white rounded-sm text-xs outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
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
            Upload image
          </button>
        )}

        <input
          type="file"
          hidden
          ref={imagePickerRef}
          onChange={(e) => {
            // Check if input is actaully an image
            if (!e.target.files![0].type.startsWith("image/")) return;
            setImage(e.target.files![0]);
          }}
        />
      </div>
      <div className="mt-4 flex w-full text-xs">
        <button
          disabled={loading || !image}
          className={`bg-dark rounded-sm disabled:cursor-not-allowed disabled:bg-[#E0E0E0] text-white h-[40px] px-4 flex gap-x-2 items-center justify-center hover:bg-dark/80 w-full`}
          type="submit"
        >
          {loading ? <LoadSmall /> : "Upload artwork"}
        </button>
      </div>
    </form>
  );
}
