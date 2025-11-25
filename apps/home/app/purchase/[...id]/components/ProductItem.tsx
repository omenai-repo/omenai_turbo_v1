"use client";

import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Image from "next/image";

/* eslint-disable @next/next/no-img-element */

export default function ProductItem({
  artwork,
}: {
  artwork: ArtworkSchemaTypes & { createdAt: string; updatedAt: string };
}) {
  const image_href = getOptimizedImage(artwork.url, "thumbnail", 40);
  return (
    // Artwork Checkout Component
    <div className="w-full max-w-md mx-auto mb-5">
      <div className="bg-white rounded shadow-lg overflow-hidden">
        {/* Artwork Section */}
        <div className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Image Container */}
            <div className="relative group">
              <div className="absolute inset-0 bg-slate-100 rounded blur-2xl opacity-30 scale-90"></div>
              <div className="relative group w-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 rounded-2xl blur-3xl opacity-30 scale-95"></div>
                <Image
                  src={image_href}
                  alt={`${artwork.title} image`}
                  width={280} // max width
                  height={400} // max height
                  className="relative rounded object-cover shadow-md transition-transform duration-300 transform group-hover:scale-105 cursor-pointer"
                />
              </div>
            </div>

            {/* Artwork Details */}
            <div className="text-center space-y-2 w-full">
              <h1 className="font-bold text-fluid-md text-dark tracking-tight">
                {artwork.title}
              </h1>
              <p className="font-normal  text-fluid-xxs text-dark/60 italic">
                {artwork.artist}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-slate-50 px-8 py-6">
          <div className="space-y-4">
            {/* Price Row */}
            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-dark/60 font-normaltext-fluid-xxs ">
                Price
              </span>
              <span className="text-dark font-bold text-fluid-base">
                {formatPrice(artwork.pricing.usd_price)}
              </span>
            </div>

            {/* Shipping Row */}
            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-dark/60 font-normal text-fluid-xxs">
                Shipping
              </span>
              <span className="text-slate-500 italic text-fluid-xxs">
                To be calculated
              </span>
            </div>

            {/* Total Section */}
            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-dark font-bold text-fluid-sm">Total</span>
                <div className="text-right">
                  <p className="text-slate-500 text-fluid-xxs italic">
                    Pending final calculation
                  </p>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-amber-50 rounded p-3 border border-amber-200">
                <p className="text-amber-800 text-xs leading-relaxed">
                  <span className="font-semibold">Note:</span> Additional duties
                  and taxes may apply at import
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
