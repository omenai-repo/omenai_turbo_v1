"use client";

import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { MdError, MdOutlineArrowForward } from "react-icons/md";
import { BsImage } from "react-icons/bs";
import { toast } from "sonner";
import { useArtistAuthStore } from "@omenai/shared-state-store/src/auth/register/ArtistAuthStore";

export default function ImageUpload() {
  const {
    artistSignupData,
    currentArtistSignupFormIndex,
    updateArtistSignupData,
    setIsFieldDirty,
  } = useArtistAuthStore();
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [cover, setCover] = useState<File | null>(
    (artistSignupData as Record<string, any>)["logo"],
  );
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
    setCover(e.target.files![0]);
    updateArtistSignupData("logo", e.target.files![0]);
    setIsFieldDirty("logo", false);
    setErrorList([]);
    e.target.value = "";
  };

  return (
    <AnimatePresence key={`${currentArtistSignupFormIndex}-gallery`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.33 }}
        className="flex flex-col space-y-6 w-full"
      >
        <label
          htmlFor="logo"
          className="text-dark text-fluid-xxs font-light sm:text-fluid-xs"
        >
          Upload a logo or a picture of yourself
        </label>
        <div className="w-full h-[250px]">
          {cover ? (
            <Image
              src={URL.createObjectURL(cover as File)}
              alt="uploaded image"
              width={500}
              height={500}
              className="w-full h-[250px] object-contain object-center mt-2 filter hover:grayscale transition-all duration-200 rounded cursor-not-allowed border p-2 border-[#d4d4d4]"
              onClick={() => {
                setCover(null);
                updateArtistSignupData("logo", null);
              }}
            />
          ) : (
            <button
              type="button"
              className="w-full h-full border text-fluid-xxs grid place-items-center duration-300 border-[#d4d4d4] rounded outline-none p-5 hover:border-dark"
              onClick={() => {
                imagePickerRef.current?.click();
              }}
            >
              <BsImage className="text-fluid-2xl" />
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
                <MdError className="text-red-600" />
                <p className="text-red-600 text-fluid-xxs">{error}</p>
              </div>
            );
          })}
      </motion.div>
    </AnimatePresence>
  );
}
