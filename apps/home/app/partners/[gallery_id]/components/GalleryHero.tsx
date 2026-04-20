// app/gallery/[gallery_id]/GalleryHero.tsx
import React from "react";
import { getOptimizedLogoImage } from "@omenai/shared-lib/storage/getImageFileView";
import { GallerySchemaTypes } from "@omenai/shared-types";

export const GalleryHero = ({ gallery }: { gallery: GallerySchemaTypes }) => {
  return (
    <section className="w-full bg-white">
      {/* ── Main identity block ── */}
      <div className="w-full px-4 pt-14 pb-10">
        <div className="flex items-start justify-between gap-8">
          {/* Left: logo mark + name + location */}
          <div className="flex items-start gap-5 min-w-0">
            {/* Logo mark — only rendered if logo exists */}
            {gallery.logo && (
              <div className="shrink-0 w-20 h-20 border border-neutral-200 flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={getOptimizedLogoImage(gallery.logo, "medium")}
                  alt={`${gallery.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Name + location */}
            <div className="flex flex-col gap-2 min-w-0">
              <h1 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light text-dark leading-[1] tracking-tight">
                {gallery.name}
              </h1>
              {gallery.address?.city && (
                <p className="font-sans text-[14px] text-neutral-500">
                  {gallery.address.city}
                  {gallery.address.country
                    ? `, ${gallery.address.country}`
                    : ""}
                </p>
              )}
            </div>
          </div>

          {/* Right: Follow button */}
          <div className="shrink-0 pt-1">
            <button className="font-sans text-[11px] font-medium text-dark border border-dark px-8 py-3 hover:bg-dark hover:text-white transition-all duration-200 leading-none tracking-wide rounded-sm">
              Follow
            </button>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="w-full h-px bg-neutral-200" />
    </section>
  );
};
