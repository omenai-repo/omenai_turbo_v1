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
import { BUTTON_CLASS } from "../styles/inputClasses";

const safeImage = (url: string | undefined | null) =>
  url || "/images/placeholder-omenai.jpg";

/* =====================================================================
   DESIGN TOKENS
   Primary:   #091830  — Deep Navy
   Accent:    #C9A96E  — Warm Gold
   Surface:   #F4F6FA  — Cool Off-White
   Card:      #FFFFFF
   Border:    #D6DEEA
   Text-1:    #091830
   Text-2:    #3D5068
   Text-3:    #7A8FA6
   ===================================================================== */

/* =====================================================================
   1. CURATOR'S PICKS CARD
   — Image maintains natural aspect ratio
   — Text block is pushed to the bottom via mt-auto so titles/prices
     align at the same baseline across a row of varying-height cards
   ===================================================================== */

export function PublicArtworkCard({ artwork }: { artwork: any }) {
  if (!artwork) return null;

  const optimizedUrl = artwork.url
    ? getOptimizedImage(artwork.url, "medium")
    : null;

  return (
    <Link
      href={`/artwork/${artwork.art_id || artwork._id}`}
      className="group/card flex flex-col w-full transition-all duration-300"
      // No h-full — height is dictated entirely by the image's natural aspect ratio
    >
      {/* Image — renders at its intrinsic aspect ratio, never cropped */}
      <div className="w-full  overflow-hidden rounded-sm bg-[#F4F6FA]">
        <img
          src={safeImage(optimizedUrl)}
          alt={artwork.title}
          className="w-full h-auto block object-contain transition-transform duration-700 group-hover/card:scale-[1.03]"
        />
      </div>

      {/* Text block — sits flush below the image, no mt-auto */}
      <div className="pt-4 flex flex-col gap-[0.2rem]">
        <span className="font-sans text-[0.72rem] font-normal tracking-wide text-dark ">
          {artwork.artist}
        </span>

        <span className="font-serif text-[1.15em] font-medium text-dark leading-snug line-clamp-2">
          {artwork.title}
          {artwork.year ? `, ${artwork.year}` : ""}
        </span>

        <div className="flex justify-between items-center mt-2">
          <span className="font-sans uppercase text-[0.62rem] text-[#7A8FA6] font-light tracking-[0.1em]">
            {artwork.medium}
          </span>
        </div>
      </div>
    </Link>
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
        ? "bg-[#091830] text-dark border border-neutral-100 hover:border-[#C9A96E]/40 hover:shadow-[0_8px_32px_rgba(9,24,48,0.35)]"
        : "bg-white text-dark border border-neutral-100 hover:border-[#091830]/20 hover:shadow-[0_6px_24px_rgba(9,24,48,0.09)]"
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
            className="object-cover opacity-75 transition-transform duration-700 group-hover/card:scale-[1.04]"
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
