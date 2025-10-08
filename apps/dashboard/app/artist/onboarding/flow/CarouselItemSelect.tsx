import { artistOnboardingStore } from "@omenai/shared-state-store/src/artist/onboarding/ArtistOnboardingStateStore";
import { ArtistOnboardingData } from "@omenai/shared-types";
import { motion } from "framer-motion";
import React, { ChangeEvent } from "react";
interface CarouselItemSelectProps {
  question: string;
  label: string;
  options: string[];
  isInteractable: boolean;
}
export default function CarouselItemSelect({
  question,
  label,
  options,
  isInteractable,
}: CarouselItemSelectProps) {
  const [selectedOption, setSelectedOption] = React.useState<string>("");
  const { updateOnboardingData, update_field_completion_state } =
    artistOnboardingStore();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateOnboardingData(
      label as keyof ArtistOnboardingData,
      value.toLowerCase()
    );
    update_field_completion_state(label as keyof ArtistOnboardingData, true);
    setSelectedOption(e.target.value);
  };
  return (
    <div
      className={`${isInteractable ? "opacity-100 pointer-events-auto" : "opacity-50 pointer-events-none"}`}
    >
      <div className="flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/30 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded drop-shadow-lg">
        <div className="w-full">
          <h2 className="text-fluid-xxs font-medium mb-6 text-left">
            {question}
          </h2>
          {/* Options */}
          <div className="space-y-3">
            {options.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 p-3 text-fluid-xxs bg-transparent text-dark rounded cursor-pointer transition duration-300 focus-within:ring-2 focus-within:ring-blue-500"
              >
                <input
                  type="radio"
                  name={label}
                  id={label}
                  value={option}
                  checked={selectedOption === option}
                  onChange={handleChange}
                  className="hidden"
                />
                <motion.div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedOption === option ? "border-dark" : "border-gray-500"}`}
                  animate={
                    selectedOption === option ? { scale: [1, 1.2, 1] } : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  {selectedOption === option && (
                    <div className="w-2.5 h-2.5 bg-dark rounded" />
                  )}
                </motion.div>
                <span className="text-dark">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
