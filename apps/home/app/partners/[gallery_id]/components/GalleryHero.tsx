import React from "react";
import { getOptimizedLogoImage } from "@omenai/shared-lib/storage/getImageFileView";
import { GallerySchemaTypes } from "@omenai/shared-types";
import FollowComponent from "@omenai/shared-ui-components/components/likes/FollowComponent";

export const GalleryHero = ({ gallery }: { gallery: GallerySchemaTypes }) => {
  return (
    <section className="w-full bg-white">
      {/* ── Main identity block ── */}
      <div className="w-full px-4 md:px-8 py-8">
        <div className="flex items-start justify-between gap-8">
          {/* Left: logo mark + name + location */}
          <div className="flex items-start gap-5 min-w-0">
            {/* Logo mark — only rendered if logo exists */}
            {gallery.logo && (
              <div className="shrink-0 w-20 h-20 flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={getOptimizedLogoImage(gallery.logo, "medium")}
                  alt={`${gallery.name} logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Name + location */}
            <div className="flex flex-col gap-2 min-w-0">
              <h1 className="font-serif text-[clamp(2rem,3vw,3rem)] font-light text-dark leading-[1] tracking-tight">
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
            <FollowComponent
              followerCount={gallery.followerCount}
              entityId={gallery.gallery_id}
              entityType="gallery"
            />
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="w-full h-px bg-neutral-200" />
    </section>
  );
};
