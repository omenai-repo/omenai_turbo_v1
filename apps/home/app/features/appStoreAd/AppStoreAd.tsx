import Image from "next/image";
import React from "react";

export default function AppStoreAd() {
  return (
    <div className="p-4 bg-[#eee7e7] py-[5rem] lg:py-[6rem] h-full max-h-full">
      <div className="flex flex-col justify-center items-center w-full ">
        <h1 className="text-[20px] xs:text-[24px] sm:text-[28px] xl:text-[36px] 2xl:text-[48px] font-bold text-gray-700 text-center leading-none">
          Care for a more Immersive experience? <br /> Download the Omenai App
          today.
        </h1>

        <div className="my-12 max-h-[800px]">
          <Image
            src={"/images/store_ad.png"}
            width={300}
            height={500}
            alt="App store ad image"
            className="h-[300px] max-h-[500px] sm:w-full sm:h-full aspect-auto object-contain
          "
          />
        </div>

        <div>
          <Image
            src={"/images/google_play.png"}
            width={200}
            height={50}
            alt="Google Play Store icon"
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
