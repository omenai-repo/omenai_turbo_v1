"use client";

import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { MdError, MdOutlineArrowForward } from "react-icons/md";

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
        className="flex flex-col gap-2 container w-full items-center"
      >
        <div className="w-[200px] h-[200px]">
          {cover ? (
            <Image
              src={URL.createObjectURL(cover as File)}
              alt="uploaded image"
              width={200}
              height={200}
              className="w-[200px] h-[200px] object-cover object-top mt-2 filter hover:grayscale transition-all duration-200 rounded-lg cursor-not-allowed"
              onClick={() => {
                setCover(null);
                updateGallerySignupData("logo", null);
              }}
            />
          ) : (
            <button
              type="button"
              className="w-full h-full border text-[14px] duration-300 border-dark/10 rounded-md outline-none p-5 focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
              onClick={() => {
                imagePickerRef.current?.click();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-6 h-6 mr-2 inline-block"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              Upload Gallery Logo
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
        <div className="self-center flex gap-4 mt-8">
          <button
            className={`${
              currentGallerySignupFormIndex > 0 ? "block" : "hidden"
            }   h-[40px] px-4 mt-[1rem] bg-dark text-white text-[14px] font-normal hover:bg-dark/80 transition-all ease-linear duration-200`}
            type={"button"}
            onClick={handleClickPrev}
          >
            Back
          </button>
          <button
            className=" h-[40px] px-4 mt-[1rem] text-[14px] font-normal bg-dark text-white flex justify-center items-center gap-x-2 hover:bg-dark/80 transition-all ease-linear duration-200"
            type={"button"}
            onClick={handleClick}
          >
            <span>Next</span>
            <MdOutlineArrowForward />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
