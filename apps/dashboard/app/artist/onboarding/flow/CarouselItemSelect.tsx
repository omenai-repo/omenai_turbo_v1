import { motion } from "framer-motion";
import React from "react";
interface CarouselItemSelectProps {
  question: string;
  label: string;
  options: string[];
}
export default function CarouselItemSelect({
  question,
  label,
  options,
}: CarouselItemSelectProps) {
  const [selectedOption, setSelectedOption] = React.useState<string>("");
  return (
    <div>
      <div className="flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/10 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded-[20px] drop-shadow-lg">
        <div className="w-full">
          <h2 className="text-[14px] font-medium mb-6 text-left">{question}</h2>
          {/* Options */}
          <div className="space-y-3">
            {options.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 p-3 text-xs bg-transparent text-dark rounded-full cursor-pointer transition duration-300 focus-within:ring-2 focus-within:ring-blue-500"
              >
                <input
                  type="radio"
                  name={label}
                  id={label}
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => setSelectedOption(option)}
                  className="hidden"
                />
                <motion.div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedOption === option ? "border-dark" : "border-gray-500"}`}
                  animate={
                    selectedOption === option ? { scale: [1, 1.2, 1] } : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  {selectedOption === option && (
                    <div className="w-2.5 h-2.5 bg-dark rounded-full" />
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
