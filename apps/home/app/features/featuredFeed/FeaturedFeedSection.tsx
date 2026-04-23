"use client";

import React, { useCallback } from "react";
import { fetchCurationData } from "@omenai/shared-services/curation/fetchCuratedData";
import { PolymorphicFeaturedItem } from "@omenai/shared-ui-components/components/curation/Cards"; // <-- IMPORT NEW POLYMORPHIC ROUTER
import { useQuery } from "@tanstack/react-query";
import { FeaturedFeedSkeleton } from "../curatorPicks/CuratorPicksSkeleton";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const fetchFeaturedFeed = async () => {
  const featuredFeed = await fetchCurationData("featured_feed");

  if (!featuredFeed.isOk || featuredFeed.data.length === 0) return null;
  return featuredFeed.data;
};

export default function FeaturedFeedSection() {
  const {
    data: featuredFeed,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["curated_feed", "featured_feed"],
    queryFn: fetchFeaturedFeed,
    staleTime: 1000 * 60 * 5,
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (isLoading) return <FeaturedFeedSkeleton />;
  if (isError || !featuredFeed || featuredFeed.length === 0) return null;

  return (
    <section className=" overflow-hidden">
      <div className="max-w-[1700px] mx-auto relative">
        <header className="mb-16 flex flex-col items-start max-w-[600px]">
          <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-[#1C1917] mb-3">
            Featured
          </h2>
          <div className="w-[60px] h-[3px] bg-[#C9A96E] mb-5"></div>
          <p className="font-sans text-sm text-neutral-500 leading-relaxed">
            Stories from the art world, leading global galleries, and exclusive
            exhibitions.
          </p>
        </header>

        {/* Carousel Wrapper */}
        <div className="relative group">
          <button
            onClick={scrollPrev}
            className="absolute left-6 top-[35%] -translate-y-1/2 w-12 h-12 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] hidden md:flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={32} strokeWidth={1.5} className="ml-[-2px]" />
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-6 md top-[35%] md:flex hidden -translate-y-1/2 w-12 h-12 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={32} strokeWidth={1.5} className="mr-[-2px]" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            {/* items-stretch ensures all cards in view snap to the same height */}
            <div className="flex touch-pan-y -ml-8 items-stretch">
              {featuredFeed.map((item: any, index: number) => {
                return (
                  <div
                    key={item.identifier || index}
                    // STRICT width formatting: no more custom promotional spanning
                    className="min-w-0 pl-8 shrink-0 flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_25%]"
                  >
                    <PolymorphicFeaturedItem item={item} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
