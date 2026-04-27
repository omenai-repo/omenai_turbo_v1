// components/public/ShowsCarouselClient.tsx
"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView"; // Your Appwrite formatter
import { getEventStatus } from "@omenai/shared-utils/src/getEventStatus"; // Your temporal status helper

export const ShowsCarouselClient = ({ shows }: { shows: any[] }) => {
  // Configure Embla: dragFree allows smooth, momentum-based scrolling
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  if (!shows || shows.length === 0) return null;

  return (
    <div className="overflow-hidden w-full" ref={emblaRef}>
      <div className="flex touch-pan-y space-x-6 md:space-x-8">
        {shows.map((show) => {
          const status = getEventStatus(show.start_date, show.end_date);
          const isClosed = status === "Past";

          return (
            <div
              key={show.event_id}
              // Card width sizing: 85% on mobile (so the next card peeks), ~33% on desktop
              className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_35%] lg:flex-[0_0_28%] min-w-0 group"
            >
              <Link href={`/shows/${show.event_id}`} className="block w-full">
                {/* Image Container */}
                <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden mb-4 rounded-sm">
                  <img
                    src={getOptimizedImage(show.cover_image, "medium")}
                    alt={show.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                      isClosed ? "grayscale-[50%] opacity-80" : ""
                    }`}
                  />

                  {/* Status Badge overlays the image nicely */}
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-2.5 py-1 text-[9px] uppercase tracking-widest font-medium rounded-sm backdrop-blur-md ${
                        isClosed
                          ? "bg-black/60 text-white"
                          : "bg-white/90 text-dark shadow-sm"
                      }`}
                    >
                      {isClosed ? "Closed" : show.event_type.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-col space-y-1 pr-4">
                  <span className="text-xs text-neutral-500 font-medium tracking-wide">
                    {show.gallery?.name || "Gallery"}
                  </span>
                  <h3 className="text-xl font-light text-dark leading-tight line-clamp-2 group-hover:text-neutral-600 transition-colors">
                    {show.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 tracking-wide uppercase pt-1">
                    {new Date(show.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    —{" "}
                    {new Date(show.end_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
