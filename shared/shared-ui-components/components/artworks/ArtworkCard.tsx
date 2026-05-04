"use client";

/**
 * ArtworkCard — Gallery-marketplace aesthetic (Artsy-style)
 *
 * KEY CHANGE: Images render at their TRUE intrinsic dimensions.
 * No fixed aspect-ratio box. No `fill`. Height is always `auto`.
 * Portrait paintings stay tall. Landscapes stay wide. Squares stay square.
 *
 * ── MASONRY (recommended) ─────────────────────────────────────────────────────
 *   <div className="columns-2 sm:columns-3 lg:columns-4 gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid">
 *     {artworks.map((art) => <ArtworkCard key={art.art_id} {...art} />)}
 *   </div>
 *
 * ── HORIZONTAL SCROLL ────────────────────────────────────────────────────────
 *   <div className="flex gap-4 overflow-x-auto pb-4">
 *     {artworks.map((art) => (
 *       <div key={art.art_id} className="shrink-0 w-[200px]">
 *         <ArtworkCard {...art} />
 *       </div>
 *     ))}
 *   </div>
 */

import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Link from "next/link";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { base_url, dashboard_url } from "@omenai/url-config/src/config";
import FadeUpCard from "../animations/FadeUpCard";
import { ArtworkSchemaTypes } from "@omenai/shared-types";
import { Download } from "lucide-react";
import { useMemo } from "react";
import LikeComponent from "../likes/LikeComponent";
import ArtistExclusivityCountdown from "./ArtistExclusivityCountdown";

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
  image_format,
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
  medium: string;
  trending?: boolean;
  countdown?: Date | null;
  isAdmin?: boolean;
  handleDownload?: (url: string, title: string) => void;
  image_format?: ArtworkSchemaTypes["image_format"];
}) {
  const image_href = getOptimizedImage(image, "small");
  const base_uri = base_url();
  const encoded_url = encodeURIComponent(art_id).replaceAll(/\//g, "%2F");
  const isAvailable = Boolean(availability);

  const expiryDate = useMemo(
    () => (countdown ? new Date(countdown) : null),
    [countdown],
  );

  /*
   * Natural dimensions — used so Next.js can reserve the correct layout space
   * and so the browser knows the ratio before the image loads.
   * Falls back to a portrait-ish default if image_format isn't supplied yet.
   */
  const imgW = 600;
  const imgH = 800;

  return (
    <FadeUpCard>
      <div className="group/card relative w-full flex flex-col">
        <div className="relative w-full overflow-hidden bg-neutral-100 rounded-sm">
          <Image
            src={image_href}
            alt={name}
            width={imgW}
            height={imgH}
            className="
              w-full h-auto block
              transition-transform duration-700 ease-out
              group-hover/card:scale-[1.03] rounded-sm 
            "
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* ── Full-card click target (sits above image, below other UI) ── */}
          <Link
            href={`${base_uri}/artwork/${encoded_url}`}
            className="absolute inset-0 z-10"
            aria-label={`View ${name} by ${artist}`}
          />

          {/* ── Hover scrim + "Quick View" label ── */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/35 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-end justify-center pb-5">
              <span
                className="
                translate-y-2 opacity-0
                group-hover/card:translate-y-0 group-hover/card:opacity-100
                transition-all duration-300 delay-75
                border border-white text-white
                text-[9px] uppercase tracking-[0.3em] font-medium font-sans
                px-5 py-2.5 leading-none
              "
              >
                Quick View
              </span>
            </div>
          </div>

          {/* ── Trending badge ── */}
          {trending && (
            <div className="absolute top-2.5 left-2.5 z-30">
              <span
                className="
                bg-black/55 backdrop-blur-sm text-white
                text-[9px] uppercase tracking-[0.2em] font-medium font-sans
                px-2.5 py-1.5 leading-none
              "
              >
                ♥ {impressions}
              </span>
            </div>
          )}

          {/* ── Gallery dashboard: Edit button ── */}
          {isDashboard && dashboard_type === "gallery" && isAvailable && (
            <div className="absolute top-2.5 right-2.5 z-30">
              <Link
                href={`${dashboard_url()}/gallery/artworks/edit?id=${art_id}`}
              >
                <button
                  className="
                  bg-white/90 backdrop-blur-sm text-black
                  text-[9px] uppercase tracking-[0.15em] font-medium font-sans
                  px-3 py-1.5 leading-none
                  border border-neutral-200 hover:border-black
                  transition-colors duration-150
                "
                >
                  Edit
                </button>
              </Link>
            </div>
          )}

          {/* ── Like component ── */}
          {!isDashboard && !isAdmin && (
            <div className="absolute bottom-2.5 right-2.5 z-10">
              <LikeComponent
                impressions={impressions}
                likeIds={likeIds}
                sessionId={sessionId}
                art_id={art_id}
              />
            </div>
          )}

          {/* ── Admin: download ── */}
          {isAdmin && handleDownload && (
            <div
              className="absolute top-2.5 right-2.5 z-30 cursor-pointer"
              onClick={() => handleDownload(image, name)}
            >
              <div
                className="
                bg-white/90 backdrop-blur-sm p-2
                border border-neutral-200 hover:border-black hover:bg-black hover:text-white
                transition-all duration-150
              "
              >
                <Download size={13} />
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            METADATA
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-1.5 pt-3">
          {/* Artist */}
          <p
            className="
            text-[10px] uppercase tracking-[0.22em] font-medium font-sans
            text-neutral-500 leading-none truncate
          "
          >
            {artist}
          </p>

          {/* Title — italic serif */}
          <Link
            href={`${base_uri}/artwork/${encoded_url}`}
            className="group/title block"
          >
            <h3
              className="
              font-serif  text-[16px] font-normal text-black
              leading-snug line-clamp-2
              group-hover/title:opacity-50 transition-opacity duration-200
            "
            >
              {name}
            </h3>
          </Link>

          {/* Medium */}
          {medium && (
            <p className="text-[11px] font-sans font-light text-neutral-400 tracking-wide leading-none">
              {medium}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-0.5">
            {!isAvailable && (
              <span
                className={`
              text-[9px] uppercase tracking-[0.18em] font-medium font-sans
              px-2 py-1 border leading-none shrink-0
              ${
                isAvailable
                  ? "border-black text-black"
                  : "border-neutral-300 text-neutral-400"
              }
            `}
              >
                Sold
              </span>
            )}

            {isAvailable && (
              <div className="text-right min-w-0">
                {pricing?.shouldShowPrice === "Yes" ? (
                  <span className="font-sans text-[14px] font-semibold text-black leading-none">
                    {formatPrice(pricing.usd_price)}
                  </span>
                ) : (
                  <span className="font-sans text-[12px] font-normal italic text-neutral-400 leading-none">
                    Request Price
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            DASHBOARD EXTRAS
        ══════════════════════════════════════════════════════════════════ */}
        {isDashboard && (
          <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium font-sans text-neutral-400">
                Status
              </span>
              <span
                className={`
                text-[9px] uppercase tracking-[0.15em] font-medium font-sans
                px-2 py-1 border leading-none
                ${
                  isAvailable
                    ? "border-black text-black"
                    : "border-neutral-300 text-neutral-400"
                }
              `}
              >
                {isAvailable ? "Available" : "Sold"}
              </span>
            </div>

            {dashboard_type === "artist" && expiryDate && isAvailable && (
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
