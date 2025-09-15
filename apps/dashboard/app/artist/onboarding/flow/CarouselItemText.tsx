import React, { ChangeEvent } from "react";
import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import { ArtistOnboardingData } from "@omenai/shared-types";
interface CarouselItemTextProps {
  question: string;
  label: keyof ArtistOnboardingData;
  isInteractable: boolean;
}

export default function CarouselItemText({
  question,
  label,
  isInteractable,
}: CarouselItemTextProps) {
  const { updateOnboardingData, update_field_completion_state } =
    artistOnboardingStore();
  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const value = e.target.value;
    updateOnboardingData(label as keyof ArtistOnboardingData, value);
    update_field_completion_state(label as keyof ArtistOnboardingData, true);
  };

  return (
    <div
      className={`${isInteractable ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none"} flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/30 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded shadow-md`}
    >
      <div className="w-full">
        <h2 className="text-fluid-xs font-medium mb-6 text-left">{question}</h2>
      </div>
      {label === "bio" ? (
        <div>
          <textarea
            name={label}
            id={label}
            rows={5}
            onChange={handleChange}
            placeholder="Please provide your answer"
            className="resize-none focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out w-full p-4 rounded placeholder:text-dark/40 placeholder:text-fluid-xs placeholder:font-normal text-fluid-xs font-medium bg-[#fafafa]/50"
          />
          <span className="text-red-600 font-light text-[12px]">
            This would be visible to everyone
          </span>
        </div>
      ) : (
        <input
          type="number"
          placeholder="Your answer"
          name="label"
          onChange={handleChange}
          className="disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-fluid-xs font-medium h-[35px] p-5 rounded w-full placeholder:text-fluid-xs placeholder:text-dark/40 placeholder:font-normal"
        />
      )}

      {/* {errorList.length > 0 &&
        errorList.map((error, index) => {
          return (
            <div
              key={`${index}-error_list`}
              className="flex items-center gap-x-2"
            >
              <MdError className="text-red-600" />
              <p className="text-red-600 text-fluid-xs sm:text-fluid-xs">{error}</p>
            </div>
          );
        })} */}
    </div>
  );
}
