"use client";

import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Link from "next/link";
import LikeComponent from "../likes/LikeComponent";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";
import { encodeMediumForUrl } from "@omenai/shared-utils/src/encodeMediumUrl";
import ArtistExclusivityCountdown from "./ArtistExclusivityCountdown";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteArtwork } from "@omenai/shared-services/artworks/deleteArtwork";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadSmall } from "../loader/Load";
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
  dashboard_type = "gallery",
  availability,
  medium,
  trending = false,
  countdown,
}: any) {
  const queryClient = useQueryClient();
  const image_href = getOptimizedImage(image, "small");
  const base_uri = base_url();
  const encoded_url = encodeURIComponent(art_id).replaceAll(/\//g, "%2F");
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const router = useRouter();
  const { csrf } = useAuth({ requiredRole: "gallery" });

  const expiryDate = useMemo(
    () => (countdown ? new Date(countdown) : null),
    [countdown]
  );

  return (
    <FadeUpCard>
      <div className="group relative w-full bg-white transition-all duration-700">
        {/* 1. THE FRAME - Using a fixed min-height to ensure visibility */}
        <div className="relative w-full overflow-hidden bg-neutral-50 border border-neutral-100 p-2">
          <Link
            href={`${base_uri}/artwork/${encoded_url}`}
            className="block w-full"
          >
            {/* Using a standard img or Image with defined dimensions 
                to prevent the "0px height" collapse 
            */}
            <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
              <Image
                src={image_href}
                alt={name}
                width={400} // Explicit width
                height={500} // Explicit height
                className="w-full h-auto object-contain transition-transform duration-[2s] group-hover:scale-105"
                priority={false}
              />
            </div>

            {/* Minimalist Overlay */}
            <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/[0.02] transition-colors duration-500" />
          </Link>

          {/* TOP LEFT: Medium Label */}
          <div className="absolute top-4 left-4 overflow-hidden pointer-events-none">
            <span className="translate-y-10 group-hover:translate-y-0 transition-transform duration-500 block text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">
              {medium}
            </span>
          </div>

          {/* TOP RIGHT: Action */}
          {!isDashboard && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <LikeComponent
                impressions={impressions}
                likeIds={likeIds}
                sessionId={sessionId}
                art_id={art_id}
              />
            </div>
          )}

          {/* BOTTOM QUICK ACTION */}
          {availability && !isDashboard && (
            <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-white/95 backdrop-blur-xl border-t border-neutral-100">
              <Link
                href={`${base_uri}/artwork/${encoded_url}`}
                className="flex items-center justify-between group/link"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-dark">
                  {pricing?.shouldShowPrice === "Yes"
                    ? "Acquire Piece"
                    : "Request Details"}
                </span>
                <div className="w-6 h-[1px] bg-dark group-hover/link:w-12 transition-all duration-500"></div>
              </Link>
            </div>
          )}
        </div>

        {/* 2. THE INFO PANEL */}
        <div className="mt-5 space-y-2 px-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-400">
                {artist}
              </p>
              <h3 className="text-lg font-serif italic text-neutral-900 leading-tight">
                {name}
              </h3>
            </div>

            <div className="text-right">
              {!availability ? (
                <span className="text-[10px] uppercase tracking-widest font-bold text-red-500">
                  Sold
                </span>
              ) : (
                <p className="text-fluid-xs font-semibold text-slate-800">
                  {pricing?.price && pricing.shouldShowPrice === "Yes"
                    ? formatPrice(pricing.usd_price)
                    : "Price on Request"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </FadeUpCard>
  );
}
