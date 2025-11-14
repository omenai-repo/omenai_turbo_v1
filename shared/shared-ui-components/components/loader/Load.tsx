"use client";

import { DotLoader, PulseLoader } from "react-spinners";
import animationData from "@omenai/shared-json/src/loader.json";
import dynamic from "next/dynamic";

// Dynamically import Lottie with SSR turned off
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import "@dotlottie/react-player/dist/index.css";
export default function Load() {
  return (
    <div className="w-full h-[calc(75dvh-10rem)] grid place-items-center">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: 120 }}
      />
    </div>
  );
}
export const HomeLoad = () => {
  return (
    <div className="w-full h-[calc(100dvh-10rem)] grid place-items-center">
      <div>
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ width: 120 }}
        />
      </div>
    </div>
  );
};

export const LoadSmall = () => {
  return (
    <div className="w-fit">
      <PulseLoader size={5} />
    </div>
  );
};

export const LoadIcon = () => {
  return (
    <div className="w-fit">
      <DotLoader size={20} />
    </div>
  );
};
