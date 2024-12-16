"use client";

import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

/* eslint-disable @next/next/no-img-element */

export default function ProductItem({
  artwork,
}: {
  artwork: ArtworkSchemaTypes & { createdAt: string; updatedAt: string };
}) {
  const image_href = getImageFileView(artwork.url, 200);
  return (
    <div className="w-full">
      <div className="border border-dark/10 px-5 py-12">
        <div className="flex flex-col gap-2">
          <img
            src={image_href}
            alt={artwork.title + " image"}
            className="w-auto max-w-[200px] max-h-[400px] h-auto aspect-auto object-top object-contain cursor-pointer"
          />
          <div className="">
            <div className="flex flex-col gap-y1">
              <p className="font-normal text-dark/70 text-base">
                {artwork.title.substring(0, 20)}
                {artwork.title.length > 20 && "..."}
              </p>
              <p className="font-normal text-base text-dark/70">
                {artwork.artist.substring(0, 20)}
                {artwork.artist.length > 20 && "..."}
              </p>
            </div>
          </div>
        </div>
        <hr className="border-dark/30 my-5" />

        <div className="text-[14px]">
          <div className="flex justify-between items-center  my-3 text-dark/70">
            <p>Price</p>
            <p className="font-normal">
              {formatPrice(artwork.pricing.usd_price)}
            </p>
          </div>
          <div className="flex justify-between items-center text-dark/70 my-3">
            <p>Shipping</p>
            <p className="font-normal">To be calculated</p>
          </div>
          <div className="flex justify-between items-center text-dark/70 my-3">
            <p>Taxes</p>
            <p className="font-normal">To be calculated</p>
          </div>
          <div className="flex justify-between items-center font-normal text-base mt-10">
            <p>Grand total</p>
            <p className="text-[14px]">Waiting for final cost</p>
          </div>
          <p className="my-3 text-dark/70 italic text-xs">
            *Additional duties and taxes may apply at import
          </p>
        </div>
      </div>
    </div>
  );
}
