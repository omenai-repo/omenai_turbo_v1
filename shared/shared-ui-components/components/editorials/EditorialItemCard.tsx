"use client";
import { Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { BsArrowRight } from "react-icons/bs";

type EditorialSchemaTypes = {
  headline: string;
  summary?: string;
  cover: string;
  date: Date | null;
  content: string;
  slug: string;
  $id?: string;
};

export default function EditorialItemCard({
  editorial,
  isFeatured = false,
}: {
  editorial: EditorialSchemaTypes;
  isFeatured?: boolean;
}) {
  const url = editorial.cover
    ? getEditorialFileView(editorial.cover, isFeatured ? 1000 : 600)
    : null;

  const formattedDate = editorial.date
    ? new Date(editorial.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Archive";

  return (
    <Link
      href={`${base_url()}/articles/${editorial.slug}?id=${editorial.$id}`}
      className="group block h-full w-full cursor-pointer"
    >
      <article className="relative h-full w-full overflow-hidden rounded-md border border-neutral-200 bg-neutral-900 transition-all duration-500 hover:shadow-xl hover:border-neutral-500">
        {/* 1. BACKGROUND IMAGE (Full Bleed for ALL cards) */}
        <div className="absolute inset-0 z-0">
          {url ? (
            <Image
              src={url}
              alt={editorial.headline}
              fill
              // object-cover ensures no empty space. object-top focuses on faces/heads.
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-600">
              <ImageIcon className="h-10 w-10" />
            </div>
          )}

          {/* GRADIENT OVERLAY - Essential for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300 group-hover:via-black/50" />
        </div>

        {/* 2. CONTENT OVERLAY */}
        {/* Using flex-col justify-end guarantees content sits at the bottom */}
        <div className="relative z-10 flex h-full flex-col justify-end p-6 md:p-8">
          {/* TOP BADGE (Featured Only) */}
          {isFeatured && (
            <div className="absolute top-6 left-6 md:top-8 md:left-8">
              <span className="bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full font-sans text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                Cover Story
              </span>
            </div>
          )}

          {/* TEXT CONTENT */}
          <div className="flex flex-col gap-3">
            {/* Date */}
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-6 bg-white/70 rounded-full" />
              <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-white/80">
                {formattedDate}
              </span>
            </div>

            {/* Headline - Larger for Featured */}
            <h3
              className={`
                font-serif font-medium text-white leading-[1.1] transition-colors
                ${isFeatured ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"}
              `}
            >
              {editorial.headline}
            </h3>

            {/* Summary - Visible on Featured Only */}
            {isFeatured && editorial.summary && (
              <p className="mt-2 font-sans text-sm md:text-base text-white/80 line-clamp-3 leading-relaxed max-w-2xl">
                {editorial.summary}
              </p>
            )}

            {/* Action Button - Always visible, slides on hover */}
            <div className="mt-4 flex items-center gap-2">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-white group-hover:underline underline-offset-4 decoration-white/50">
                Read Story
              </span>
              <BsArrowRight className="text-white text-sm transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
