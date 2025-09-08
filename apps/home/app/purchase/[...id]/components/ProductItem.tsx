"use client";

import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

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
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Artwork Section */}
        <div className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Image Container */}
            <div className="relative group">
              <div className="absolute inset-0 bg-slate-100 rounded-md blur-2xl opacity-30 scale-90"></div>
              <img
                src={image_href}
                alt={artwork.title + " image"}
                className="relative w-auto max-w-[280px] rounded max-h-[400px] h-auto object-cover cursor-pointer shadow-md transition-transform duration-300 transform active:scale-95"
              />
            </div>

            {/* Artwork Details */}
            <div className="text-center space-y-2 w-full">
              <h1 className="font-bold text-fluid-md text-dark tracking-tight">
                {artwork.title}
              </h1>
              <p className="font-normal  text-fluid-xs text-dark/60 italic">
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
              <span className="text-dark/60 font-normaltext-fluid-xs ">
                Price
              </span>
              <span className="text-dark font-bold text-fluid-base">
                {formatPrice(artwork.pricing.usd_price)}
              </span>
            </div>

            {/* Shipping Row */}
            <div className="flex justify-between items-center py-3 border-b border-slate-200">
              <span className="text-dark/60 font-normal text-fluid-xs">
                Shipping
              </span>
              <span className="text-slate-500 italic text-fluid-xs">
                To be calculated
              </span>
            </div>

            {/* Total Section */}
            <div className="pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-dark font-bold text-fluid-sm">Total</span>
                <div className="text-right">
                  <p className="text-slate-500 text-fluid-xs italic">
                    Pending final calculation
                  </p>
                </div>
              </div>

              {/* Notice */}
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <p className="text-amber-800 text-xs leading-relaxed">
                  <span className="font-semibold">Note:</span> Additional duties
                  and taxes may apply at import
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {/* <div className="p-6 bg-white border-t border-slate-100">
          <button className="w-full py-3 px-4 text-fluid-xs bg-dark text-white font-semibold rounded-md shadow-sm transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2">
            Create order request
          </button>
        </div> */}
      </div>
    </div>
  );
}
