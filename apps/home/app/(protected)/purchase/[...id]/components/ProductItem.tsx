"use client";

import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Image from "next/image";

export default function ProductItem({
  artwork,
}: {
  artwork: ArtworkSchemaTypes & { createdAt: string; updatedAt: string };
}) {
  const image_href = getOptimizedImage(artwork.url, "medium", 90);

  return (
    <div className="w-full bg-neutral-50 border border-neutral-200 p-6">
      {/* 1. ASSET HEADER */}
      <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
        <span className="font-sans text-[9px] uppercase tracking-widest text-neutral-500">
          Asset Reference
        </span>
        <span className="font-sans text-[9px] uppercase tracking-widest text-dark">
          #{artwork.art_id.slice(-6)}
        </span>
      </div>

      {/* 2. IMAGE PREVIEW (Reduced Size) */}
      <div className="relative mb-6 w-full bg-white p-4 border border-neutral-100">
        {/* Changed w-full to w-32 (128px) and added mx-auto to center it */}
        <div className="relative aspect-[3/4] w-64 mx-auto overflow-hidden bg-neutral-100 shadow-sm">
          <Image
            src={image_href}
            alt={artwork.title}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 3. METADATA */}
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-xl italic text-dark leading-tight">
            {artwork.title}
          </h1>
          <p className="font-sans text-xs text-neutral-500 mt-1">
            by {artwork.artist}
          </p>
        </div>

        {/* 4. FINANCIAL TABLE */}
        <div className="border-t border-neutral-200 pt-6">
          <div className="flex justify-between items-end mb-4">
            <span className="font-sans text-xs uppercase tracking-wide text-neutral-500">
              Acquisition Price
            </span>
            <span className="font-sans text-sm text-dark">
              {formatPrice(artwork.pricing.usd_price)}
            </span>
          </div>

          <div className="flex justify-between items-end mb-4">
            <span className="font-sans text-xs uppercase tracking-wide text-neutral-500">
              Shipping
            </span>
            <span className="font-sans text-xs text-neutral-400 italic">
              Calculated on review
            </span>
          </div>

          <div className="mt-6 border-t border-neutral-200 pt-4 flex justify-between items-end">
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-dark">
              Estimated Total
            </span>
            <div className="text-right">
              <p className="font-sans text-lg text-dark">
                {formatPrice(artwork.pricing.usd_price)}*
              </p>
              <p className="font-sans text-[10px] text-neutral-400 mt-1">
                *Excluding duties & shipping
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
