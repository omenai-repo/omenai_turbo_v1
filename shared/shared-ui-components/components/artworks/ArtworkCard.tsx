"use client";
/* eslint-disable @next/next/no-img-element */
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

import Link from "next/link";
import LikeComponent from "../likes/LikeComponent";

import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

import { HiPencil } from "react-icons/hi";
import Image from "next/image";

export default function ArtworkCard({
  image,
  artist,
  name,
  pricing,
  impressions,
  likeIds,
  sessionId,
  art_id,
  isDashboard = false,
  availability,
}: {
  image: string;
  artist: string;
  name: string;
  impressions: number;
  likeIds: string[];
  sessionId: string | undefined;
  art_id: string;
  pricing?: {
    price: number;
    usd_price: number;
    shouldShowPrice: "Yes" | "No" | string;
  };
  isDashboard?: boolean;
  availability: boolean;
}) {
  const image_href = getImageFileView(image, 250);
  return (
    <div className="my-2 max-w-full p-0 max-h-full rounded-[20px]">
      <div className="flex flex-col w-full h-full justify-end">
        <div className="relative w-full artContainer">
          <Link href={`/artwork/${name}`} className="relative">
            <Image
              src={image_href}
              alt={name + " image"}
              loading="lazy"
              height={500}
              width={500}
              className="w-full rounded-[20px] h-full aspect-auto object-cover object-center cursor-pointer artImage"
            />
          </Link>
          <div className="bg-[#FFFFFF] py-[5px] rounded-[28px] text-[9px] absolute px-[13px] top-[25px] left-[12px]">
            Mixed Media
          </div>

          <div className="absolute top-[20px] right-[12px]">
            {isDashboard ? null : (
              <LikeComponent
                impressions={impressions}
                likeIds={likeIds}
                sessionId={sessionId}
                art_id={art_id}
              />
            )}
          </div>

          <div className="flex items-center justify-center">
            {/* Glass Card */}
            <div className="p-3 rounded-2xl bg-white/30 backdrop-blur-sm shadow-lg absolute bottom-[20px] left-[20px] right-[20px]">
              {/* Title */}
              <div className="text-gray-400 text-[14px]">
                {name} – {artist.substring(0, 20)}
                {artist.length > 20 && "..."}
              </div>

              <div className="flex justify-between mt-[15px]">
                {/* Price */}
                <div className="text-white text-[14px] font-bold">
                  {pricing?.price && pricing.shouldShowPrice === "Yes"
                    ? !availability
                      ? "Sold"
                      : `${formatPrice(pricing.usd_price)}`
                    : !availability
                      ? "Sold"
                      : "Price on request"}
                </div>

                {/* Purchase Button */}
                {!availability ? null : (
                  <button className="px-4 py-[5px] rounded-full bg-white text-black text-xxxs font-medium shadow">
                    {pricing?.price && pricing.shouldShowPrice === "Yes"
                      ? "Purchase"
                      : "Request"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* <div className=" bg-[#FAFAFA] border border-[#E0E0E0] px-3 y-2 w-full">
          <div className="flex flex-col space-y-1 my-2">
            <p className="font-normal text-xs text-dark ">
              {name}
              {/* {name.length > 20 && "..."}
            </p>

            <div className="flex justify-between items-center">
              <p className="font-normal text-[#858585] italic text-xs">
                {artist.substring(0, 20)}
                {artist.length > 20 && "..."}
              </p>
              {/* <HiPencil /> 
              {isDashboard && (
                <Link href={`/gallery/artworks/edit?id=${name}`}>
                  <button
                    className={`disabled:cursor-not-allowed disabled:text-dark/20 text-xs font-normal underline cursor-pointer`}
                  >
                    Edit artwork
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

// components/ImageGallery.js
