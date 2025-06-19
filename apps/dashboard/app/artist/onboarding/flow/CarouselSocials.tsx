import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import { ArtistOnboardingData, Socials } from "@omenai/shared-types";
import React, { ChangeEvent } from "react";

export default function CarouselSocials({
  isInteractable,
}: {
  isInteractable: boolean;
}) {
  const { updateOnboardingData, update_field_completion_state } =
    artistOnboardingStore();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const social_key = e.target.name;

    updateOnboardingData(
      "socials" as keyof ArtistOnboardingData,
      value,
      social_key.toLowerCase() as keyof Socials
    );
    update_field_completion_state(
      "socials" as keyof ArtistOnboardingData,
      true
    );
  };
  return (
    <div
      className={`${isInteractable ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none"} flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/10 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded-[10px] shadow-md`}
    >
      <div className="w-full">
        <h2 className="text-fluid-xs font-medium mb-6 text-left">
          Upload social handles{" "}
          <span className="text-[12px]"> (Min. of 1 required)</span>
        </h2>

        <div className="flex flex-col gap-y-4">
          {["Instagram", "Twitter", "LinkedIn"].map((social) => {
            return (
              <input
                key={social}
                placeholder={`${social} handle`}
                onChange={handleChange}
                name={social}
                className="disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-fluid-xxs font-medium h-[35px] p-5 rounded-full w-full placeholder:text-[12px] placeholder:text-dark/40 placeholder:font-light"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
