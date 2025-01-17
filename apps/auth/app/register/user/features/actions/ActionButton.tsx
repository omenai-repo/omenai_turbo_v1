import { useIndividualAuthStore } from "@omenai/shared-state-store/src/auth/register/IndividualAuthStore";
import React from "react";
import { MdOutlineArrowForward } from "react-icons/md";

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
    setIsFieldDirty,
  } = useIndividualAuthStore();

  const handleClickPrev = () => {
    setIsFieldDirty(false);
    decrementCurrentSignupFormIndex();
  };
  const handleClickNext = () => {
    incrementCurrentSignupFormIndex();
  };
  return (
    <div className="mt-6 flex gap-4">
      <button
        className={`${
          currentSignupFormIndex > 0 ? "block" : "hidden"
        }   bg-dark hover:bg-dark/80 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/50 disabled:text-white rounded-full h-[40px] p-5 sm:p-6 w-full text-center text-xs sm:text-[14px] flex items-center justify-center hover:ring-white cursor-pointer`}
        type={"button"}
        onClick={handleClickPrev}
      >
        Back
      </button>
      <button
        className="bg-dark hover:bg-dark/80 text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/50 disabled:text-white rounded-full h-[40px] p-5 sm:p-6 w-full text-center text-xs sm:text-[14px] flex items-center justify-center hover:ring-white cursor-pointer"
        type={"button"}
        disabled={isFieldDirty || !preference_chosen}
        onClick={handleClickNext}
      >
        <span>Continue</span>
        <MdOutlineArrowForward />
      </button>
    </div>
  );
}
