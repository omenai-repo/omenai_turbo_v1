"use client";
/* eslint-disable @next/next/no-img-element */
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

import Link from "next/link";
import LikeComponent from "../likes/LikeComponent";

import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";

import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";
import { IoIosArrowRoundForward } from "react-icons/io";

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
  dashboard_type = "gallery",
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
  dashboard_type?: "artist" | "gallery";
  availability: boolean;
  medium: string;
  trending?: boolean;
}) {
  const image_href = getImageFileView(image, 500);
  const base_uri = base_url();

  const encoded_url = encodeURIComponent(name).replace(/\//g, "%2F");
  return (
    <div className="group relative bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative">
        <Link
          href={`${base_uri}/artwork/${encoded_url}`}
          className="block relative"
        >
          {/* Image Container - Natural Aspect Ratio */}
          <div className="relative overflow-hidden">
            <Image
              src={image_href}
              alt={name + " image"}
              height={500}
              width={500}
              loading="lazy"
              quality={100}
              placeholder="blur"
              blurDataURL="data:image/webp;base64,UklGRl4CAABXRUJQVlA4WAoAAAAgAAAA2wAApAAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggcAAAAHALAJ0BKtwApQA+bTaZSaQjIqEgSACADYlpbuF2sRtAE9r0VcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBkENVSa7bRcIMghqqTXbaLhBjkAA/v+8dAAAAAAAAAA="
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Subtle overlay for better text contrast */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
          </div>
        </Link>

        {/* Top Left Badge */}
        <div className="absolute top-4 left-4 z-10">
          {isDashboard && dashboard_type === "gallery" ? (
            <Link href={`/artist/app/artworks/edit?id=${name}`}>
              <button className="bg-white/90 backdrop-blur-sm text-dark rounded-full px-4 py-2 text-fluid-xs font-normal shadow-sm border border-gray-200 transition-colors duration-200 hover:bg-white">
                Edit artwork
              </button>
            </Link>
          ) : (
            <button className="group/btn relative flex items-center gap-x-2 bg-white/10 backdrop-blur-sm text-white px-4 xs:px-5 py-1 xs:py-2 text-fluid-xxs rounded-md border border-white/20 transition-all duration-300 hover:bg-white hover:text-black hover:border-white hover:shadow-lg transform hover:scale-105 active:scale-95">
              <span className="font-semibold">{medium}</span>

              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
            </button>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {trending && (
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
              {impressions} {impressions > 1 ? "likes" : "like"}
            </div>
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
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Artwork Details */}
        <div className="space-y-2 mb-3">
          <h3 className="font-medium text-dark text-fluid-base leading-tight line-clamp-2">
            {name}
          </h3>
          <p className="text-dark/60 text-fluid-xs">
            by {artist.length > 25 ? `${artist.substring(0, 25)}...` : artist}
          </p>
        </div>

        {/* Price and Actions */}
        {!trending && (
          <div className="flex items-center justify-between">
            {/* Price */}
            <div className="flex flex-col">
              {!availability ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-fluid-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  Sold
                </span>
              ) : (
                <div className="text-[#1a1a1a] font-semibold text-fluid-base">
                  {pricing?.price && pricing.shouldShowPrice === "Yes"
                    ? formatPrice(pricing.usd_price)
                    : "Price on request"}
                </div>
              )}
            </div>

            {/* Action Button */}
            {availability && !isDashboard && (
              <Link
                href={`${base_uri}/artwork/${encoded_url}`}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-dark text-white text-fluid-xs font-medium transition-colors duration-200 hover:bg-dark/80"
              >
                {pricing?.price && pricing.shouldShowPrice === "Yes"
                  ? "Purchase"
                  : "Inquire"}
              </Link>
            )}
          </div>
        )}

        {/* Dashboard-specific price display */}
        {isDashboard && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-fluid-xs">
              <span className="text-gray-600">Status:</span>
              {!availability ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                  Sold
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  Available
                </span>
              )}
            </div>
            {pricing?.price && pricing.shouldShowPrice === "Yes" && (
              <div className="flex items-center justify-between text-fluid-xs mt-2">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-dark">
                  {formatPrice(pricing.usd_price)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
