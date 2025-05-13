"use client";

import { DotLoader, PulseLoader } from "react-spinners";
import animationData from "@omenai/shared-json/src/black_loader.json";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import Lottie with SSR turned off
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
// import "@dotlottie/react-player/dist/index.css";
export default function Load() {
  return (
    <div className="w-full h-[calc(100dvh-10rem)] grid place-items-center">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: 150 }}
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
          style={{ width: 150 }}
        />

        <Image
          src={
            "https://fra.cloud.appwrite.io/v1/storage/buckets/6822733300074eb56561/files/68231da4000e5b382a50/view?project=682272b1001e9d1609a8&mode=admin"
          }
          alt="omenai logo"
          width={130}
          height={50}
          priority={true}
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
