import { motion } from "framer-motion";
import React, { useState } from "react";
import { CiWarning } from "react-icons/ci";

export default function CarouselAcknowledgement() {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-col items-center h-[18rem] w-full p-6 bg-white focus:ring ring-1 border-0 ring-dark/10 outline-none focus:outline-none focus:ring-dark transition-all duration-200 ease-in-out rounded-[20px] shadow-md">
      <div className="w-full">
        {/* <h2 className="text-[14px] font-medium mb-6 text-left">
          Submit verification request
        </h2> */}
        <div className="w-full my-2">
          <CiWarning className="text-sm" />
        </div>

        <span className="text-dark text-xs">
          By submitting, you confirm that all information provided is true and
          accurate. Any discrepancies may impact the verification process.
        </span>
        <div className="mt-[2rem]">
          <button className="bg-dark whitespace-nowrap hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-full h-[40px] p-6 w-full text-center text-[14px] flex items-center justify-center hover:ring-white cursor-pointer">
            Submit verification request
          </button>
        </div>
      </div>
    </div>
  );
}
