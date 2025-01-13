import Image from "next/image";
import React from "react";

export default function AppStoreAd() {
  return (
    <div className="p-4 bg-[#eee7e7] py-[5rem] lg:py-[6rem] max-h-[90vh]">
      <div className="flex flex-col justify-center items-center w-full ">
        <h1 className="text-[20px] xs:text-[24px] sm:text-[28px] lg:text-[36px] xl:text-[48px] 2xl:text-[60px] font-[900] text-dark text-center leading-none">
          Care for a more Immersive experience? <br /> Download the Omenai App
          today.
        </h1>

        <div className="my-12 max-h-[800px]">
          <Image
            src={"/images/store_ad.png"}
            width={350}
            height={550}
            alt="App store ad image"
            className="h-[300px] sm:w-full sm:h-full aspect-auto object-contain
          "
          />
        </div>

        <div>
          <div className="bg-dark rounded-md  w-fit flex items-center gap-x-1 py-2 px-4">
            <Image
              src={"/images/google_play.png"}
              width={48}
              height={48}
              alt="Google Play Store icon"
            />
            <div>
              <p className="text-white font-light text-base uppercase">
                Get it on
              </p>
              <p className="text-white font-bold text-sm">Google Play</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
