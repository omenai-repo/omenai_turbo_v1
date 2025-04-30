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
      <div className="border-1 border-dark/10 py-6">
        <div className="flex flex-col gap-2">
          <img
            src={image_href}
            alt={artwork.title + " image"}
            className="w-auto max-w-[200px] rounded-[20px] max-h-[400px] h-auto aspect-auto object-top object-contain cursor-pointer"
          />
          <div className="">
            <div className="flex flex-col gap-y1">
              <h1 className="font-bold text-dark/80 text-fluid-base">
                {artwork.title}
              </h1>
              <p className="font-medium italic text-fluid-base text-dark/80">
                {artwork.artist}
              </p>
            </div>
          </div>
        </div>
        <hr className="border-dark/30 my-5" />

        <div className="text-fluid-xs">
          <div className="flex justify-between items-center  my-3 text-dark/80">
            <p>Price</p>
            <p className="font-bold">
              {formatPrice(artwork.pricing.usd_price)}
            </p>
          </div>
          <div className="flex justify-between items-center text-dark/80 my-3">
            <p>Shipping fee</p>
            <p className="font-normal">To be calculated</p>
          </div>
          <div className="flex justify-between items-center text-dark/80 my-3">
            <p>Taxes</p>
            <p className="font-normal">To be calculated</p>
          </div>
          <div className="flex justify-between items-center font-bold text-fluid-base mt-10">
            <p>Grand total</p>
            <p className="text-fluid-xs">Waiting for final cost</p>
          </div>
          <p className="my-3 text-dark/80 font-normal italic text-fluid-xs">
            *Additional duties and taxes may apply at import
          </p>
        </div>
      </div>
    </div>
  );
}
