import React from "react";
interface CarouselItemTextProps {
  question: string;
  label: string;
}
export default function CarouselItemText({
  question,
  label,
}: CarouselItemTextProps) {
  return (
    <div className="flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/10 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded-[20px] shadow-md">
      <div className="w-full">
        <h2 className="text-[14px] font-medium mb-6 text-left">{question}</h2>
      </div>

      <textarea
        name={label}
        id={label}
        rows={8}
        placeholder="Please provide your answer"
        className="resize-none focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out w-full p-4 rounded-[20px] placeholder:text-gray-700/40 placeholder:text-xs placeholder:font-light text-xs font-medium bg-[#fafafa]/50"
      />

      {/* {errorList.length > 0 &&
        errorList.map((error, index) => {
          return (
            <div
              key={`${index}-error_list`}
              className="flex items-center gap-x-2"
            >
              <MdError className="text-red-600" />
              <p className="text-red-600 text-xs sm:text-[14px]">{error}</p>
            </div>
          );
        })} */}
    </div>
  );
}
