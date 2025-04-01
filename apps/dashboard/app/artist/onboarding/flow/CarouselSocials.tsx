import React from "react";

export default function CarouselSocials() {
  return (
    <div className="flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/10 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded-[20px] shadow-md">
      <div className="w-full">
        <h2 className="text-[14px] font-medium mb-6 text-left">
          Upload social handles{" "}
          <span className="text-[12px]"> (Min. of 1 required)</span>
        </h2>

        <div className="flex flex-col gap-y-4">
          {["Instagram", "Twitter", "LinkedIn"].map((social) => {
            return (
              <input
                key={social}
                placeholder={`${social} handle`}
                className="disabled:cursor-not-allowed disabled:bg-dark/10 focus:ring ring-1 border-0 ring-dark/20 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out text-xs font-medium h-[40px] p-5 sm:p-6 rounded-full w-full placeholder:text-[12px] placeholder:text-gray-700/40 placeholder:font-light"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
