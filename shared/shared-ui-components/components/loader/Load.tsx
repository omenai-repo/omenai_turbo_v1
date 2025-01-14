"use client";

import { DotLoader, PulseLoader } from "react-spinners";

export default function Load() {
  return (
    <div className="w-full h-[80vh] grid place-items-center">
      <DotLoader size={30} />
    </div>
  );
}

export const LoadSmall = () => {
  return (
    <div className="w-fit">
      <PulseLoader size={5} />
    </div>
  );
};
