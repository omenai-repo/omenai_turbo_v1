"use client";

import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Link from "next/link";
import LikeComponent from "../likes/LikeComponent";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";
import FadeUpCard from "../animations/FadeUpCard";

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
}: any) {
  const image_href = getOptimizedImage(image, "small");
  const base_uri = base_url();
  const encoded_url = encodeURIComponent(art_id).replaceAll(/\//g, "%2F");

  return (
    <FadeUpCard>
      <div className="group relative w-full flex flex-col gap-3">
        {/* 1. IMAGE CONTAINER */}
        <div className="relative w-full overflow-hidden rounded-md bg-slate-100">
          <Link
            href={`${base_uri}/artwork/${encoded_url}`}
            className="block w-full"
          >
            <div className="relative">
              <Image
                src={image_href}
                alt={name}
                width={500}
                height={600}
                // Removed the grayscale filter on sold items so they shine fully
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* STATUS BADGE: Discrete, Premium, Non-Obstructive */}
              {!availability && (
                <div className="absolute top-2 left-2 z-20">
                  <span className="inline-flex items-center justify-center bg-[#091830] px-2.5 py-1 rounded text-[10px] font-sans font-normal uppercase tracking-widest text-white shadow-sm ring-1 ring-white/10">
                    Acquired
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Floating Actions (Only if available or if you want users to like sold items too) */}
          {!isDashboard && (
            <div className="absolute bottom-4 right-2 z-20 transition-opacity duration-300">
              <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-sm p-1 transition-colors">
                <LikeComponent
                  impressions={impressions}
                  likeIds={likeIds}
                  sessionId={sessionId}
                  art_id={art_id}
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. PRODUCT DETAILS */}
        <div className="flex flex-col gap-0.5 px-1">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-serif text-md text-dark  leading-snug group-hover:underline decoration-slate-300 underline-offset-4 line-clamp-2">
              <Link href={`${base_uri}/artwork/${encoded_url}`}>{name}</Link>
            </h3>

            {/* PRICE / STATUS */}
            <div className="text-right shrink-0">
              {!availability ? (
                <span className="font-sans text-xs font-semibold text-dark uppercase tracking-wider">
                  Acquired
                </span>
              ) : pricing?.shouldShowPrice === "Yes" ? (
                <span className="font-sans text-fluid-base font-bold text-dark ">
                  {formatPrice(pricing.usd_price)}
                </span>
              ) : (
                <span className="font-sans text-xs font-medium text-slate-500">
                  On Request
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-1">
            <p className="font-sans text-fluid-xs text-slate-500 max-w-[70%]">
              {artist}
            </p>
            <p className="font-sans text-[10px] text-slate-400 uppercase truncate tracking-wide">
              {medium}
            </p>
          </div>
        </div>
      </div>
    </FadeUpCard>
  );
}
