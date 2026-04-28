// components/public/galleries/FeaturedGalleriesSection.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import { getOptimizedLogoImage } from "@omenai/shared-lib/storage/getImageFileView";
import { FeaturedGalleriesSkeleton } from "./FeaturedGalleriesSkeleton";
import { fetchGalleries } from "@omenai/shared-services/gallery/fetchGalleries";
import { GallerySchemaTypes } from "@omenai/shared-types";
import FollowComponent from "@omenai/shared-ui-components/components/likes/FollowComponent";
const fetchFeaturedGalleries = async () => {
  const response = await fetchGalleries(1, 15);
  if (!response.isOk) {
    throw new Error("Failed to fetch featured galleries");
  }
  return { data: response.data, pagination: response.pagination };
};

export const FeaturedGalleriesSection = () => {
  const {
    data: galleries,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["featuredGalleries"],
    queryFn: fetchFeaturedGalleries,
    staleTime: 1000 * 60 * 10,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const cleanedGalleryList = useMemo(() => {
    const galleryData = galleries?.data || [];

    return galleryData.filter(
      (gallery: GallerySchemaTypes) =>
        gallery.name.toLowerCase() !== "omenai gallery" ||
        gallery.name.toLowerCase() !== "ankh gallery",
    );
  }, [galleries]);

  if (isLoading) {
    return <FeaturedGalleriesSkeleton />;
  }

  if (isError || cleanedGalleryList.length === 0) {
    return null;
  }
  return (
    <section className="w-full bg-white">
      <div className="max-w-full mx-auto">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-light text-black leading-none tracking-tight">
              {/* Uses the total from pagination to show the true number of galleries */}
              Featured Galleries{" "}
              <sup className="text-blue-600 text-lg font-sans">
                (
                {galleries?.pagination?.total || cleanedGalleryList.length || 0}
                )
              </sup>
            </h2>
            <div className="w-[60px] h-[3px] bg-[#C9A96E] my-5"></div>
          </div>

          <Link
            href="/partners"
            className="text-xs font-sans uppercase tracking-widest font-medium text-dark hover:text-neutral-500 transition-colors pb-1 border-b border-transparent hover:border-neutral-500 sm:shrink-0 self-start sm:self-auto"
          >
            View All Galleries
          </Link>
        </div>

        <div className="relative group">
          <div className="overflow-hidden w-full" ref={emblaRef}>
            <div className="flex touch-pan-y space-x-6">
              {cleanedGalleryList.map((gallery: GallerySchemaTypes) => {
                const isOmitGallery =
                  gallery.name.toLowerCase() === "omenai gallery";
                if (isOmitGallery) return null;
                return (
                  <div
                    key={gallery.gallery_id}
                    className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_25%] min-w-0"
                  >
                    <div className="flex flex-col h-full border border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm transition-all duration-300 rounded-sm group/card">
                      {/* 4:3 Image Container (Wrapped in Link) */}
                      <Link
                        href={`/partners/${gallery.gallery_id}`}
                        className="block relative w-full aspect-[4/3] bg-neutral-50 overflow-hidden rounded-t-sm"
                      >
                        {gallery.logo ? (
                          <img
                            src={getOptimizedLogoImage(gallery.logo, "medium")}
                            alt={`${gallery.name} logo`}
                            // object-cover provides the fill effect inside the 4:3 box
                            className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover/card:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                            <span className="font-serif text-sm text-neutral-300 uppercase">
                              {gallery.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Info & Button Container */}
                      <div className="p-5 flex items-center justify-between w-full gap-4">
                        {/* Text (Wrapped in Link) */}
                        <Link
                          href={`/gallery/${gallery.gallery_id}`}
                          className="flex flex-col gap-1 flex-1 min-w-0"
                        >
                          <h3 className="font-serif text-lg text-dark truncate">
                            {gallery.name}
                          </h3>
                          {gallery.address?.city && (
                            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium truncate">
                              {gallery.address.city}
                              {gallery.address.country
                                ? `, ${gallery.address.country}`
                                : ""}
                            </p>
                          )}
                        </Link>

                        {/* Follow Button (Isolated outside the Link) */}
                        <FollowComponent
                          followerCount={gallery.followerCount}
                          entityId={gallery.gallery_id}
                          entityType="gallery"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          {prevBtnEnabled && (
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-1/2 p-3 sm:p-4 bg-white/90 backdrop-blur-md border border-neutral-200 text-neutral-500 rounded-full shadow-sm hover:text-dark hover:border-neutral-300 hover:bg-white transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Previous galleries"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {nextBtnEnabled && (
            <button
              onClick={scrollNext}
              className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-1/2 p-3 sm:p-4 bg-white/90 backdrop-blur-md border border-neutral-200 text-neutral-500 rounded-full shadow-sm hover:text-dark hover:border-neutral-300 hover:bg-white transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Next galleries"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
