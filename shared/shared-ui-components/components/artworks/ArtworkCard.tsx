"use client";

import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Link from "next/link";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";
import FadeUpCard from "../animations/FadeUpCard";
import { ArtworkMediumTypes } from "@omenai/shared-types";
import { Download } from "lucide-react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { deleteArtwork } from "@omenai/shared-services/artworks/deleteArtwork";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import LikeComponent from "../likes/LikeComponent";
import ArtistExclusivityCountdown from "./ArtistExclusivityCountdown";
import { encodeMediumForUrl } from "@omenai/shared-utils/src/encodeMediumUrl";
import { LoadSmall } from "../loader/Load";

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
  isAdmin = false,
  handleDownload,
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
  isAdmin?: boolean;
  handleDownload?: (url: string, title: string) => void;
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
    [countdown],
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

  console.log(expiryDate);
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
                // Removed the slatescale filter on sold items so they shine fully
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* STATUS BADGE: Discrete, Premium, Non-Obstructive */}
              {!availability && !isDashboard && (
                <div className="absolute top-2 left-2 z-20">
                  <span className="inline-flex items-center justify-center bg-[#091830] px-2.5 py-1 rounded text-[10px] font-sans font-normal uppercase tracking-widest text-white shadow-sm ring-1 ring-white/10">
                    Sold
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Floating Actions (Only if available or if you want users to like sold items too) */}
          <div className="absolute top-4 right-4 z-10">
            {isDashboard && dashboard_type === "gallery" && (
              <button
                onClick={deleteUploadArtwork}
                disabled={deleteLoading}
                className="bg-white/90 backdrop-blur-sm text-dark rounded-full px-4 py-1 text-fluid-xxs font-normal shadow-sm border border-slate-200 transition-colors duration-200 hover:bg-white text-fluid-xxs disabled:cursor-not-allowed disabled:bg-dark/10 disabled:text-[#A1A1A1] disabled:bg-white"
              >
                {deleteLoading ? <LoadSmall /> : " Delete artwork"}
              </button>
            )}
          </div>
          {/* Top Right Actions */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            {trending && (
              <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                {impressions} {impressions > 1 ? "likes" : "like"}
              </div>
            )}
            {isDashboard || isAdmin ? null : (
              <LikeComponent
                impressions={impressions}
                likeIds={likeIds}
                sessionId={sessionId}
                art_id={art_id}
              />
            )}
          </div>
          {isAdmin && handleDownload && (
            <div
              className="absolute hover:text-white top-4 right-2 z-20 transition-opacity duration-300 cursor-pointer"
              onClick={() => handleDownload(image, name)}
            >
              <div className="bg-white/95 hover:bg-dark backdrop-blur-sm rounded-full shadow-sm p-2 transition-colors">
                <Download size={18} />
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
                  Sold
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

        {isDashboard && (
          <div className="space-y-4">
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-fluid-xxs">
                <span className="text-slate-600 text-fluid-xxs">Status:</span>
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
    </FadeUpCard>
  );
}
