"use client";
/* eslint-disable @next/next/no-img-element */
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

import Link from "next/link";
import LikeComponent from "../likes/LikeComponent";

import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";

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
  medium,
  trending = false,
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
  medium: string;
  trending?: boolean;
}) {
  const image_href = getImageFileView(image, 500);
  const base_uri = base_url();
  return (
    <div className="my-2 max-w-full p-0 max-h-full rounded-[20px]">
      <div className="flex flex-col w-full h-full justify-end">
        <div className="relative w-full artContainer">
          <Link href={`${base_uri}/artwork/${name}`} className="relative">
            <Image
              src={image_href}
              alt={name + " image"}
              height={500}
              width={500}
              priority
              className="w-full rounded-[20px] h-full aspect-auto object-cover object-center cursor-pointer artImage"
            />
          </Link>
          <div className=" absolute px-[14px] top-[1.5rem] left-[1rem]">
            {isDashboard ? (
              <Link href={`/gallery/artworks/edit?id=${name}`}>
                <button
                  className={`bg-white text-dark rounded-full px-3 py-2 hover:bg-dark hover:text-white duration-300 disabled:cursor-not-allowed disabled:text-dark/20 text-[14px] font-normal cursor-pointer ring ring-[#e0e0e0]/50`}
                >
                  Edit artwork
                </button>
              </Link>
            ) : (
              <div className="bg-[#FFFFFF] py-[5px] px-4 rounded-[24px] text-[14px] ring ring-[#e0e0e0]/50">
                {medium}
              </div>
            )}
          </div>

          <div className="absolute top-[20px] right-[12px] flex items-center gap-1">
            {trending && (
              <p className="text-white text-[14px]">
                Liked by {impressions} {impressions > 1 ? "people" : "person"}
              </p>
            )}
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
            <div className="p-3 flex flex-col gap-y-1 rounded-2xl bg-dark/40 backdrop-blur-sm shadow-lg absolute bottom-[20px] left-[20px] right-[20px]">
              {/* Title */}
              <div className="text-gray-400 text-[14px] xs:text-base font-light">
                {name}
              </div>
              <div className="text-gray-400 text-[14px] font-light">
                {artist.substring(0, 20)}
                {artist.length > 20 && "..."}
              </div>

              {!trending && (
                <div className="flex justify-between mt-1.5">
                  {/* Price */}
                  <div className="text-white text-[14px] xs:text-[14px] font-bold">
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
                    <Link
                      href={`${base_uri}/artwork/${name}`}
                      className="px-4 py-[5px] duration-300 ring ring-[#e0e0e0]/50 hover:bg-dark hover:text-white rounded-full bg-white text-black text-[14px] font-medium shadow"
                    >
                      {pricing?.price && pricing.shouldShowPrice === "Yes"
                        ? "Purchase"
                        : "Request"}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
