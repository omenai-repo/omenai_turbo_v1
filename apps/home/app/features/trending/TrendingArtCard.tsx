"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import LikeComponent from "@omenai/shared-ui-components/components/likes/LikeComponent";
import Image from "next/image";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { HiArrowTrendingUp } from "react-icons/hi2";

export default function TrendingArtworkCard({
  image,
  artist,
  name,
  impressions,
  likeIds,
  sessionId,
  art_id,
  availability,
}: {
  image: string;
  artist: string;
  name: string;
  impressions: number;
  medium: string;
  rarity: string;
  likeIds: string[];
  sessionId: string | undefined;
  art_id: string;
  availability: boolean;
}) {
  const image_href = getOptimizedImage(image, "small");

  return (
    <div className="group flex flex-col gap-3 w-full">
      {/* 1. IMAGE AREA - FIXED RATIO */}
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-md bg-neutral-100">
        <Link
          href={`/artwork/${encodeURIComponent(art_id)}`}
          className="block h-full w-full"
        >
          {/* BADGE LOGIC: Show 'Acquired' if sold, otherwise 'Hot' */}
          {!availability ? (
            <div className="absolute top-2 left-2 z-20">
              <span className="inline-flex items-center justify-center bg-[#091830] px-2 py-1 rounded-sm text-[10px] font-sans font-bold uppercase tracking-widest text-white shadow-sm ring-1 ring-white/10">
                Acquired
              </span>
            </div>
          ) : (
            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/95 backdrop-blur px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider text-dark  shadow-sm">
              <HiArrowTrendingUp />
              <span>Hot</span>
            </div>
          )}

          <Image
            src={image_href}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </Link>

        {/* Like Button */}
        <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="bg-white rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow">
            <LikeComponent
              impressions={impressions}
              likeIds={likeIds}
              sessionId={sessionId}
              art_id={art_id}
            />
          </div>
        </div>
      </div>

      {/* 2. DATA AREA */}
      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-serif text-md text-dark  leading-snug truncate">
          <Link href={`/artwork/${encodeURIComponent(art_id)}`}>{name}</Link>
        </h3>

        <div className="flex justify-between items-center border-t border-dashed border-neutral-200 pt-2 mt-1">
          <p className="font-sans text-xs text-neutral-500 font-medium truncate max-w-[60%]">
            {artist}
          </p>

          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <span className="font-sans font-semibold text-dark ">
              {impressions}
            </span>
            <span className="text-[9px] uppercase tracking-wide">Views</span>
          </div>
        </div>
      </div>
    </div>
  );
}
