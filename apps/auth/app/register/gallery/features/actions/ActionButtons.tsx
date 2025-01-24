import { useGalleryAuthStore } from "@omenai/shared-state-store/src/auth/register/GalleryAuthStore";
import React from "react";
import { MdOutlineArrowForward } from "react-icons/md";
import { shouldDisableNext } from "@omenai/shared-utils/src/should_disable_next_button";
import { toast } from "sonner";
const steps = {
  0: ["name", "email", "admin"],
  1: ["country", "address", "description"],
  2: ["password", "confirmPassword"],
  3: ["logo"],
};

export default function () {
  const {
    currentGallerySignupFormIndex,
    decrementCurrentGallerySignupFormIndex,
    incrementCurrentGallerySignupFormIndex,
    isFieldDirty,
    gallerySignupData,
  } = useGalleryAuthStore();

  const handleClickPrev = () => {
    decrementCurrentGallerySignupFormIndex();
  };
  const handleClickNext = () => {
    if (currentGallerySignupFormIndex === 2) {
      if (gallerySignupData.password !== gallerySignupData.confirmPassword) {
        toast.error("Error notification", {
          description: "Passwords do not match",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        return;
      }
    }
    if (shouldDisableNext(isFieldDirty, currentGallerySignupFormIndex, steps)) {
      toast.error("Error notification", {
        description: "Invalid field values",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });

      return;
    }
    incrementCurrentGallerySignupFormIndex();
  };
  return (
    <div className="self-end flex gap-4">
      <button
        className={`${
          currentGallerySignupFormIndex > 0 ? "block" : "hidden"
        }   bg-dark hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/50 disabled:text-white rounded-full h-[40px] p-6 w-full text-center text-[14px] flex items-center justify-center hover:ring-white cursor-pointer`}
        type={"button"}
        onClick={handleClickPrev}
      >
        Back
      </button>
      <button
        className="bg-dark hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/50 disabled:text-white rounded-full h-[40px] p-6 w-full text-center text-[14px] flex items-center justify-center hover:ring-white cursor-pointer"
        type={"button"}
        onClick={handleClickNext}
      >
        <span>Continue</span>
        <MdOutlineArrowForward />
      </button>
    </div>
  );
}
