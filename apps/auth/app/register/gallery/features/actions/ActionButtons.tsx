import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import React from "react";
import { MdOutlineArrowForward } from "react-icons/md";

export default function () {
  const {
    currentGallerySignupFormIndex,
    decrementCurrentGallerySignupFormIndex,
    incrementCurrentGallerySignupFormIndex,
    isFieldDirty,
    setIsFieldDirty,
  } = useGalleryAuthStore();

  const handleClickPrev = () => {
    setIsFieldDirty(false);
    decrementCurrentGallerySignupFormIndex();
  };
  const handleClickNext = () => {
    incrementCurrentGallerySignupFormIndex();
  };
  return (
    <div className="self-end flex gap-4">
      <button
        className={`${
          currentGallerySignupFormIndex > 0 ? "block" : "hidden"
        }   bg-dark hover:bg-dark/80 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/50 disabled:text-white rounded-full h-[40px] p-6 w-full text-center text-[14px] flex items-center justify-center hover:ring-white cursor-pointer`}
        type={"button"}
        onClick={handleClickPrev}
      >
        Back
      </button>
      <button
        className="bg-dark hover:bg-dark/80 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/50 disabled:text-white rounded-full h-[40px] p-6 w-full text-center text-[14px] flex items-center justify-center hover:ring-white cursor-pointer"
        type={"button"}
        disabled={isFieldDirty}
        onClick={handleClickNext}
      >
        <span>Continue</span>
        <MdOutlineArrowForward />
      </button>
    </div>
  );
}
