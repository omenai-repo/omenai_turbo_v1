"use client";

import React, { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCurationData } from "@omenai/shared-services/curation/fetchCuratedData";
import { PublicArtworkCard } from "@omenai/shared-ui-components/components/curation/Cards";
import { CuratorsPicksSkeleton } from "./CuratorPicksSkeleton";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArtworkSchemaTypes } from "@omenai/shared-types";

const fetchCuratorPicks = async () => {
  const response = await fetchCurationData("curator_picks");

  if (!response.isOk) return null;

  const data = response.data?.data || response.data;

  if (!Array.isArray(data) || data.length === 0) return null;
  return data;
};

export default function CuratorsPicksSection() {
  const {
    data: curatorPicks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["curated_feed", "curator_picks"],
    queryFn: fetchCuratorPicks,
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

  if (isLoading) return <CuratorsPicksSkeleton />;
  if (isError || !curatorPicks || curatorPicks.length === 0) return null;

  return (
    <section className="  overflow-hidden">
      <div className="max-w-full mx-auto relative">
        <header className="mb-16 flex flex-col items-start max-w-[600px]">
          <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-[#1C1917] mb-3">
            Curator's Picks
          </h2>
          <div className="w-[60px] h-[3px] bg-[#C9A96E] mb-5"></div>
          <p className="font-sans text-sm text-neutral-500 leading-relaxed">
            Discover exceptional works selected by our expert curatorial team
            this week.
          </p>
        </header>

        {/* Carousel Wrapper */}
        <div className="relative group">
          <button
            onClick={scrollPrev}
            className="absolute hidden  left-6 top-[140px] w-16 h-16 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] md:flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={32} strokeWidth={1.5} className="ml-[-2px]" />
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-6 hidden top-[140px] w-16 h-16 bg-[#FAF8F5] border border-[#E8E4DF] rounded-full shadow-[0_8px_30px_rgba(28,25,23,0.12)] md:flex items-center justify-center z-10 text-[#1C1917] transition-all hover:bg-[#1C1917] hover:text-[#FAF8F5] opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={32} strokeWidth={1.5} className="mr-[-2px]" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5 items-end pb-4">
              {curatorPicks.map((item: any, index: number) => {
                if (item.type !== "artwork") return null;
                const artwork: ArtworkSchemaTypes = item.data;
                return (
                  <div
                    key={item.identifier || index}
                    className="flex-[0_0_200px] min-w-0"
                  >
                    <PublicArtworkCard
                      image={artwork.url}
                      artist={artwork.artist}
                      name={artwork.title}
                      art_id={artwork.art_id}
                      availability={artwork.availability}
                      medium={artwork.medium}
                      pricing={artwork.pricing}
                    />
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
