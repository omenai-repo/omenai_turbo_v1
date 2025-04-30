"use client";

import { DotLoader, PulseLoader } from "react-spinners";
import Lottie from "lottie-react";
import animationData from "@omenai/shared-json/src/black_loader.json";
import Image from "next/image";
// import "@dotlottie/react-player/dist/index.css";
export default function Load() {
  return (
    <div className="w-fit flex justify-center items-center">
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
    <div className="w-fit flex flex-col justify-center items-center">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: 150 }}
      />

      <Image
        src={
          "https://fra.cloud.appwrite.io/v1/storage/buckets/66aa1aa0001a0c51d892/files/68028808001793765300/view?project=66aa198b0038ad614178&mode=admin"
        }
        alt="omenai logo"
        width={130}
        height={50}
        priority={true}
      />
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
