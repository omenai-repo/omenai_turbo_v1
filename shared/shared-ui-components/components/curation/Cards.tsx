import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, CalendarDays, ArrowUpRight } from "lucide-react";

import {
  getOptimizedImage,
  getOptimizedLogoImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";

import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";

const safeImage = (url: string | undefined | null) =>
  url || "/images/placeholder-omenai.jpg";

import { base_url } from "@omenai/url-config/src/config";
import FadeUpCard from "../animations/FadeUpCard";

export function PublicArtworkCard({
  image,
  artist,
  name,
  pricing,
  art_id,
  availability,
  medium,
}: {
  image: string;
  artist: string;
  name: string;
  art_id: string;
  pricing: {
    price: number;
    usd_price: number;
    shouldShowPrice: "Yes" | "No" | string;
  };
  availability: boolean;
  medium: string;
}) {
  const image_href = getOptimizedImage(image, "small");
  const base_uri = base_url();
  const encoded_url = encodeURIComponent(art_id).replaceAll(/\//g, "%2F");
  const isAvailable = Boolean(availability);

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
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            METADATA
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col gap-1.5 pt-3 h-[90px]">
          <p className="text-[10px] uppercase tracking-[0.22em] font-medium font-sans text-neutral-500 leading-none truncate">
            {artist}
          </p>
          <Link
            href={`${base_uri}/artwork/${encoded_url}`}
            className="group/title block"
          >
            <h3 className="font-serif text-[16px] font-normal text-black leading-snug line-clamp-2 group-hover/title:opacity-50 transition-opacity duration-200">
              {name}
            </h3>
          </Link>
          {medium && (
            <p className="text-[11px] font-sans font-light text-neutral-400 tracking-wide leading-none truncate">
              {medium}
            </p>
          )}
        </div>
        {/* Price / status row */}
        <div className="flex items-center justify-between gap-2 pt-1.5">
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
            {isAvailable ? "Available" : "Sold"}
          </span>

          {isAvailable && (
            <div className="text-right min-w-0">
              {pricing?.shouldShowPrice === "Yes" ? (
                <span className="font-sans text-[12px] font-medium text-black leading-none">
                  {formatPrice(pricing.usd_price)}
                </span>
              ) : (
                <span className="font-sans text-[10px] font-light italic text-neutral-400 leading-none">
                  Request Price
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </FadeUpCard>
  );
}

/* =====================================================================
   2. POLYMORPHIC ROUTER FOR FEATURED FEED
   ===================================================================== */

export function PolymorphicFeaturedItem({
  item,
}: {
  item: { type: string; data: any };
}) {
  if (!item || !item.data) return null;

  switch (item.type) {
    case "artwork":
      return <FeaturedArtworkCard artwork={item.data} />;
    case "gallery":
      return <FeaturedGalleryCard gallery={item.data} />;
    case "article":
      return <FeaturedEditorialCard article={item.data} />;
    case "events":
      return <FeaturedEventCard event={item.data} />;
    case "promotionals":
      return <FeaturedPromotionalCard promotional={item.data} />;
    default:
      return null;
  }
}

/* =====================================================================
   3. SHARED FEATURED CARD SHELL
   4:3 image + content block — used as a base for all featured cards
   ===================================================================== */

function FeaturedCardShell({
  href,
  imageSlot,
  badge,
  children,
  dark = false,
}: {
  href?: string;
  imageSlot: React.ReactNode;
  badge: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  const base = `group/card flex flex-col h-full rounded-[3px] overflow-hidden transition-all duration-300
    ${
      dark
        ? "bg-[#091830] text-dark border border-neutral-50 hover:border-[#C9A96E]/40 hover:shadow-[0_8px_32px_rgba(9,24,48,0.35)]"
        : "bg-white text-dark border border-neutral-50 hover:border-[#091830]/20 hover:shadow-[0_6px_24px_rgba(9,24,48,0.09)]"
    }`;

  const inner = (
    <>
      {/* 4:3 image container — object-cover fills it */}
      <div className="relative w-full pb-[75%] overflow-hidden bg-[#F4F6FA] shrink-0">
        {imageSlot}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-1">
        {/* Badge */}
        <span className="font-sans text-[0.58rem] font-bold tracking-[0.18em] uppercase text-dark mb-1">
          {badge}
        </span>
        {children}
      </div>
    </>
  );

  return href ? (
    <Link href={href} className={base}>
      {inner}
    </Link>
  ) : (
    <div className={base}>{inner}</div>
  );
}

/* Shared image component inside the 4:3 shell */
function CoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-700 group-hover/card:scale-[1.04]"
    />
  );
}

/* =====================================================================
   FEATURED ARTWORK CARD
   ===================================================================== */

function FeaturedArtworkCard({ artwork }: { artwork: any }) {
  const url = artwork.url ? getOptimizedImage(artwork.url, "medium") : null;

  return (
    <FeaturedCardShell
      href={`/artwork/${artwork.art_id || artwork._id}`}
      badge="Artwork"
      imageSlot={<CoverImage src={safeImage(url)} alt={artwork.title} />}
    >
      <h3 className="font-serif text-[1.15em] font-medium text-dark leading-snug line-clamp-2 group-hover/card:text-dark transition-colors duration-200">
        {artwork.title}
      </h3>
      <p className="font-sans text-[0.78rem] text-[#3D5068] font-medium">
        {artwork.artist}
      </p>
    </FeaturedCardShell>
  );
}

/* =====================================================================
   FEATURED EDITORIAL CARD
   ===================================================================== */

function FeaturedEditorialCard({ article }: { article: any }) {
  const url = article.cover ? getEditorialFileView(article.cover, 600) : null;

  return (
    <FeaturedCardShell
      href={`/articles/${article.slug}?id=${article.$id}`}
      badge="Editorial"
      imageSlot={<CoverImage src={safeImage(url)} alt={article.headline} />}
    >
      <h3 className="font-serif text-[1.15em] font-medium text-dark leading-snug line-clamp-2 group-hover/card:text-dark transition-colors duration-200">
        {article.headline}
      </h3>
    </FeaturedCardShell>
  );
}

/* =====================================================================
   FEATURED EVENT CARD
   ===================================================================== */

function FeaturedEventCard({ event }: { event: any }) {
  const url = event.cover_image
    ? getPromotionalOptimizedImage(event.cover_image, "medium")
    : null;

  return (
    <FeaturedCardShell
      href={`/${event.event_type === "exhibition" ? "shows" : "events"}/${event.event_id}`}
      badge={`${event.event_type === "exhibition" ? "Exhibition" : event.event_type === "art_fair" ? "Art Fair" : "Viewing Room"}`}
      imageSlot={
        url ? (
          <CoverImage src={safeImage(url)} alt={event.title} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0D2040]">
            <CalendarDays size={36} className="text-[#C9A96E]/40" />
          </div>
        )
      }
    >
      <h3 className="font-serif text-[1.15rem] font-medium text-dark leading-snug line-clamp-2 group-hover/card:text-dark transition-colors duration-200">
        {event.title}
      </h3>
      {event.gallery_name && (
        <p className="font-sans text-[1.15em] text-[#3D5068] truncate">
          {event.gallery_name}
        </p>
      )}
    </FeaturedCardShell>
  );
}

/* =====================================================================
   FEATURED GALLERY CARD
   ===================================================================== */

function FeaturedGalleryCard({ gallery }: { gallery: any }) {
  const url = gallery.logo
    ? getOptimizedLogoImage(gallery.logo, "medium")
    : null;

  return (
    <FeaturedCardShell
      href={`/partners/${gallery.gallery_id}`}
      badge="Gallery Partner"
      imageSlot={
        url ? (
          <Image
            src={safeImage(url)}
            alt={gallery.name}
            fill
            /* Logos get contain + generous padding so they're never cropped */
            className="object-cover transition-transform duration-700 group-hover/card:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F4F6FA]">
            <span className="font-serif text-2xl font-light text-[#D6DEEA]">
              {gallery.name[0]?.toUpperCase()}
            </span>
          </div>
        )
      }
    >
      <h3 className="font-serif text-[1.15em] font-medium text-dark leading-snug truncate group-hover/card:text-dark transition-colors duration-200">
        {gallery.name}
      </h3>
    </FeaturedCardShell>
  );
}

/* =====================================================================
   FEATURED PROMOTIONAL CARD  (dark variant)
   ===================================================================== */

function FeaturedPromotionalCard({ promotional }: { promotional: any }) {
  const url = promotional.image
    ? getPromotionalOptimizedImage(promotional.image, "medium")
    : null;

  return (
    <Link href={promotional.cta}>
      <FeaturedCardShell
        badge="Special Feature"
        imageSlot={
          <Image
            src={safeImage(url)}
            alt={promotional.headline}
            fill
            className="object-cover transition-transform duration-700 group-hover/card:scale-[1.04]"
          />
        }
      >
        {/* Changed text-dark to text-[#FAF8F5] */}
        <h3 className="font-serif text-[1.15em] font-medium text-dark leading-snug line-clamp-2">
          {promotional.headline}
        </h3>
      </FeaturedCardShell>
    </Link>
  );
}
