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
    <div className="m-2 w-fit p-4 xxm:p-0 max-h-[500px]">
      <div className="flex flex-col min-w-[180px] w-[180px] xxl:w-[200px] md:min-w-[250px] h-full md:w-[250px] justify-end">
        <div className="relative w-full">
          <Link href={`/artwork/${name}`} className="relative">
            <Image
              src={image_href}
              alt={name + " image"}
              loading="lazy"
              height={200}
              width={250}
              className="min-w-[180px] w-[180px] xxl:w-[200px] md:min-w-[250px] max-h-[400px] md:w-[250px] h-auto aspect-auto object-contain object-center cursor-pointer"
            />
          </Link>
        </div>

        <div className=" bg-[#FAFAFA] border border-[#E0E0E0] px-3 y-2 w-full">
          <div className="flex flex-col space-y-1 my-2">
            <p className="font-normal text-xs text-dark ">
              {name}
              {/* {name.length > 20 && "..."} */}
            </p>

            <div className="flex justify-between items-center">
              <p className="font-normal text-[#858585] italic text-xs">
                {artist.substring(0, 20)}
                {artist.length > 20 && "..."}
              </p>
              {/* <HiPencil /> */}
              {isDashboard && (
                <Link href={`/dashboard/gallery/artworks/edit?id=${name}`}>
                  <button
                    className={`disabled:cursor-not-allowed disabled:text-dark/20 text-xs font-normal underline cursor-pointer`}
                  >
                    Edit artwork
                  </button>
                </Link>
              )}
            </div>

            {pricing?.price && pricing.shouldShowPrice === "Yes" ? (
              !availability ? (
                <div className="flex justify-between items-center">
                  <p className="font-medium text-xs text-dark">Sold</p>
                  {isDashboard ? null : (
                    <LikeComponent
                      impressions={impressions}
                      likeIds={likeIds}
                      sessionId={sessionId}
                      art_id={art_id}
                    />
                  )}
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="font-medium text-xs text-dark">
                    USD {formatPrice(pricing.usd_price)}
                  </p>
                  {isDashboard ? null : (
                    <LikeComponent
                      impressions={impressions}
                      likeIds={likeIds}
                      sessionId={sessionId}
                      art_id={art_id}
                    />
                  )}
                </div>
              )
            ) : !availability ? (
              <div className="flex justify-between items-center">
                <p className="font-medium text-xs text-dark">Sold</p>
                {isDashboard ? null : (
                  <LikeComponent
                    impressions={impressions}
                    likeIds={likeIds}
                    sessionId={sessionId}
                    art_id={art_id}
                  />
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="font-medium text-xs text-dark">
                  Price on request
                </p>
                {isDashboard ? null : (
                  <LikeComponent
                    impressions={impressions}
                    likeIds={likeIds}
                    sessionId={sessionId}
                    art_id={art_id}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// components/ImageGallery.js
