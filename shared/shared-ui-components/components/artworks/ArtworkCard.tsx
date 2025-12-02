"use client";
/* eslint-disable @next/next/no-img-element */
import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

import Link from "next/link";
import LikeComponent from "../likes/LikeComponent";

import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";

import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";
import { ArtworkMediumTypes } from "@omenai/shared-types";
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
  author_id: string;
  medium: ArtworkMediumTypes;
  trending?: boolean;
  countdown?: Date | null;
}) {
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

  async function deleteUploadArtwork() {
    setDeleteLoading(true);
    const deleteArtworkData = await deleteArtwork(art_id, csrf || "");

    if (!deleteArtworkData?.isOk)
      toast.error("Error notification", {
        description: deleteArtworkData?.message,
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    else {
      toast.success("Operation successful", {
        description: deleteArtworkData.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch_artworks_by_id"],
      });
      router.replace("/gallery/artworks");
    }
    setDeleteLoading(false);
  }

  return (
    <FadeUpCard>
      <div className="group relative bg-white rounded-3xl border border-gray-100 hover:border-dark/20 overflow-hidden transition-all duration-300">
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
              // <Link href={`/gallery/artworks/edit?id=${art_id}`}>
              // </Link>
              <button
                onClick={deleteUploadArtwork}
                disabled={deleteLoading}
                className="bg-white/90 backdrop-blur-sm text-dark rounded-full px-4 py-1 text-fluid-xxs font-normal shadow-sm border border-gray-200 transition-colors duration-200 hover:bg-white text-fluid-xxs disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] disabled:bg-white"
              >
                {deleteLoading ? <LoadSmall /> : " Delete artwork"}
              </button>
            ) : isDashboard && dashboard_type === "artist" ? null : (
              <Link href={`/collections/${encodeMediumForUrl(medium)}`}>
                <button className="px-4 py-1 bg-white text-dark rounded-full duration-300 backdrop-blur-xl bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-white shadow-sm">
                  <span className="font-normal text-fluid-xxs ">{medium}</span>

                  {/* Button glow effect */}
                  <div className="absolute inset-0 rounded bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
                </button>
              </Link>
            )}
          </div>

          {/* Top Right Actions */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
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
        <div className="p-4 space-y-2">
          {/* Artwork Details */}
          <div className="space-y-1">
            <h3 className="font-bold text-dark font-medium text-fluid-xs leading-tight line-clamp-2">
              {name}
            </h3>

            <p className="text-dark/90 font-normal text-fluid-xxs">
              {artist.length > 25 ? `${artist.substring(0, 25)}...` : artist}
            </p>
          </div>

          {/* Price and Actions */}
          {!trending && (
            <div className="flex items-center justify-between">
              {/* Price */}
              <div className="flex flex-col">
                {!availability ? (
                  <span className="inline-flex items-center px-3 rounded-full text-fluid-xxs font-medium bg-red-50 text-red-700 border border-red-200">
                    Sold
                  </span>
                ) : (
                  <div className="text-[#0f172a] font-semibold text-fluid-xxs">
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
                  className="flex items-center gap-x-2  shadow-[8px_8px_0px_rgba(0,0,0,0.9)] group-hover:shadow-none duration-200 bg-white border border-dark/30 text-dark rounded-2xl px-8 py-1 text-fluid-xxs"
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
            <div className="space-y-4">
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-fluid-xxs">
                  <span className="text-gray-600 text-fluid-xxs">Status:</span>
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
              </div>
              {/* Exclusivity countdown */}
              {dashboard_type === "artist" && expiryDate && availability && (
                <ArtistExclusivityCountdown
                  key={expiryDate.getTime()}
                  expiresAt={expiryDate}
                  art_id={art_id}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </FadeUpCard>
  );
}
