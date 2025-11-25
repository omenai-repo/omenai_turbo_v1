import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import { ArtistOnboardingData, Socials } from "@omenai/shared-types";
import { INPUT_CLASS } from "@omenai/shared-ui-components/components/styles/inputClasses";
import React, { ChangeEvent } from "react";

const SOCIAL_PREFIXES = {
  Instagram: "https://instagram.com/",
  Twitter: "https://x.com/",
  LinkedIn: "https://www.linkedin.com/in/",
};

export default function CarouselSocials({
  isInteractable,
}: {
  isInteractable: boolean;
}) {
  const { updateOnboardingData, update_field_completion_state } =
    artistOnboardingStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const social_key = e.target.name as keyof typeof SOCIAL_PREFIXES;
    const prefix = SOCIAL_PREFIXES[social_key];

    // Prevent deletion of prefix
    if (!value.startsWith(prefix)) {
      e.target.value = prefix;
      return;
    }

    // Only update if there's actual content after the prefix
    if (value.length > prefix.length) {
      updateOnboardingData(
        "socials" as keyof ArtistOnboardingData,
        value,
        social_key.toLowerCase() as keyof Socials
      );
      update_field_completion_state(
        "socials" as keyof ArtistOnboardingData,
        true
      );
    } else {
      // If user deletes content back to just the prefix, remove it from store
      updateOnboardingData(
        "socials" as keyof ArtistOnboardingData,
        "", // Send empty string to clear it
        social_key.toLowerCase() as keyof Socials
      );
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    social: keyof typeof SOCIAL_PREFIXES
  ) => {
    const input = e.currentTarget;
    const prefix = SOCIAL_PREFIXES[social];
    const cursorPosition = input.selectionStart || 0;

    // Prevent backspace/delete from removing prefix
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      cursorPosition <= prefix.length
    ) {
      e.preventDefault();
    }
  };

  const handleClick = (
    e: React.MouseEvent<HTMLInputElement>,
    social: keyof typeof SOCIAL_PREFIXES
  ) => {
    const input = e.currentTarget;
    const prefix = SOCIAL_PREFIXES[social];
    const cursorPosition = input.selectionStart || 0;

    // Prevent cursor placement before prefix
    if (cursorPosition < prefix.length) {
      input.setSelectionRange(prefix.length, prefix.length);
    }
  };

  const links: {
    name: keyof typeof SOCIAL_PREFIXES;
    placeholder: string;
    defaultValue: string;
  }[] = [
    {
      name: "Instagram",
      placeholder: "https://instagram.com/omenaiofficial",
      defaultValue: "https://instagram.com/",
    },
    {
      name: "Twitter",
      placeholder: "https://x.com/placeholder",
      defaultValue: "https://x.com/",
    },
    {
      name: "LinkedIn",
      placeholder: "https://www.linkedin.com/in/placeholder",
      defaultValue: "https://www.linkedin.com/in/",
    },
  ];

  return (
    <div
      className={`${isInteractable ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none"} flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/30 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded shadow-md`}
    >
      <div className="w-full">
        <h2 className="text-fluid-xxs font-medium mb-6 text-left">
          Upload social handles{" "}
          <span className="text-[12px]"> (Min. of 1 required)</span>
        </h2>

        <div className="flex flex-col gap-y-4">
          {links.map(({ defaultValue, name, placeholder }) => {
            return (
              <input
                key={name}
                placeholder={placeholder}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, name)}
                onClick={(e) => handleClick(e, name)}
                name={name}
                defaultValue={defaultValue}
                className={INPUT_CLASS}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
