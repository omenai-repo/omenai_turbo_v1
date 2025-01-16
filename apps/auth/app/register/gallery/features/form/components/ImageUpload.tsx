"use client";

import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { MdError, MdOutlineArrowForward } from "react-icons/md";
import { BsImage } from "react-icons/bs";

export default function ImageUpload() {
  const {
    gallerySignupData,
    currentGallerySignupFormIndex,
    incrementCurrentGallerySignupFormIndex,
    decrementCurrentGallerySignupFormIndex,
    updateGallerySignupData,
  } = useGalleryAuthStore();
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [cover, setCover] = useState<File | null>(
    (gallerySignupData as Record<string, any>)["logo"]
  );
  const acceptedFileTypes = ["jpg", "jpeg", "png"];

  const handleClickPrev = () => {
    decrementCurrentGallerySignupFormIndex();
  };

  const handleClick = () => {
    if ((gallerySignupData as Record<string, any>)["logo"] === null) {
      setErrorList(["Please upload your Gallery logo"]);
      return;
    }

    const type = (gallerySignupData as Record<string, any>)["logo"].type.split(
      "/"
    );

    if (!acceptedFileTypes.includes(type[1])) {
      setErrorList([
        "File type unsupported. Supported file types are: JPEG, JPG, and PNG",
      ]);
    } else {
      setErrorList([]);
      incrementCurrentGallerySignupFormIndex();
    }
  };

  return (
    <AnimatePresence key={`${currentGallerySignupFormIndex}-gallery`}>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ y: -100 }}
        transition={{ duration: 0.33 }}
        className="flex flex-col space-y-6 container w-full items-center"
      >
        <div className="w-[300px] h-[300px]">
          {cover ? (
            <Image
              src={URL.createObjectURL(cover as File)}
              alt="uploaded image"
              width={200}
              height={200}
              className="w-[300px] h-[300px] object-cover object-top mt-2 filter hover:grayscale transition-all duration-200 rounded-lg cursor-not-allowed"
              onClick={() => {
                setCover(null);
                updateGallerySignupData("logo", null);
              }}
            />
          ) : (
            <button
              type="button"
              className="w-full h-full border text-[14px] grid place-items-center duration-300 border-dark/50 rounded-md outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
              onClick={() => {
                imagePickerRef.current?.click();
              }}
            >
              <BsImage className="text-2xl" />
            </button>
          )}

          <input
            type="file"
            hidden
            ref={imagePickerRef}
            onChange={(e) => {
              // Check if input is actaully an image
              if (!e.target.files![0].type.startsWith("image/")) return;
              setCover(e.target.files![0]);
              updateGallerySignupData("logo", e.target.files![0]);
              setErrorList([]);
            }}
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
                <p className="text-red-600 text-[14px]">{error}</p>
              </div>
            );
          })}
      </motion.div>
    </AnimatePresence>
  );
}
