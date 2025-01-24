import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import { shouldDisableNext } from "@omenai/shared-utils/src/should_disable_next_button";
import React from "react";
import { MdOutlineArrowForward } from "react-icons/md";
import { toast } from "sonner";
const steps = {
  0: ["name", "email"],
  1: ["password", "confirmPassword"],
};
export default function ({
  preference_chosen = true,
}: {
  preference_chosen?: boolean;
}) {
  const {
    currentSignupFormIndex,
    decrementCurrentSignupFormIndex,
    incrementCurrentSignupFormIndex,
    isFieldDirty,
    individualSignupData,
  } = useIndividualAuthStore();

  const error_toast = (message: string) => {
    toast.error("Error notification", {
      description: message,
      style: {
        background: "red",
        color: "white",
      },
      className: "class",
    });
  };
  const handleClickPrev = () => {
    decrementCurrentSignupFormIndex();
  };
  const handleClickNext = () => {
    if (currentSignupFormIndex === 1) {
      if (
        individualSignupData.password !== individualSignupData.confirmPassword
      ) {
        error_toast("Passwords do not match");
        return;
      }
    }
    if (currentSignupFormIndex === 2 && !preference_chosen) {
      error_toast("Please select up to 5 art preferences");
      return;
    }
    if (currentSignupFormIndex !== 2) {
      if (shouldDisableNext(isFieldDirty, currentSignupFormIndex, steps)) {
        error_toast("Invalid field values");
        return;
      }
    }

    incrementCurrentSignupFormIndex();
  };
  return (
    <div className="mt-6 flex gap-4">
      <button
        className={`${
          currentSignupFormIndex > 0 ? "block" : "hidden"
        }  disabled:cursor-not-allowed bg-dark hover:bg-dark/80 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/50 disabled:text-white rounded-full h-[40px] p-5 sm:p-6 w-full text-center text-xs sm:text-[14px] flex items-center justify-center hover:ring-white cursor-pointer`}
        type={"button"}
        onClick={handleClickPrev}
      >
        Back
      </button>
      <button
        className="disabled:cursor-not-allowed bg-dark hover:bg-dark/80 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/50 disabled:text-white rounded-full h-[40px] p-5 sm:p-6 w-full text-center text-xs sm:text-[14px] flex items-center justify-center hover:ring-white cursor-pointer"
        type={"button"}
        onClick={handleClickNext}
      >
        <span>Continue</span>
        <MdOutlineArrowForward />
      </button>
    </div>
  );
}
