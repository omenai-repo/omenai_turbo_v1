"use client";

import Image from "next/image";
import { DotLoader, PulseLoader } from "react-spinners";

export default function Load() {
  return (
    <div className="w-fit">
      <DotLoader size={5} />
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
