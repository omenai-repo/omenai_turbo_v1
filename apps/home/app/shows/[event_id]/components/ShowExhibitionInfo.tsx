"use client";

import React, { useState } from "react";

interface FairEventInfoProps {
  event: any;
}

export const ShowExhibitionInfo = ({ event }: FairEventInfoProps) => {
  const [descExpanded, setDescExpanded] = useState(false);

  const descWords = (event.description || "").split(" ");
  const isLongDesc = descWords.length > 70;
  const displayedDesc =
    isLongDesc && !descExpanded
      ? descWords.slice(0, 70).join(" ") + "…"
      : event.description;
  return (
    <>
      <section className="w-full bg-white px-8 md:px-14 lg:px-20 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          {/* ── Left: metadata sidebar ── */}
          <div className="lg:col-span-4 flex flex-col gap-12">
            {/* Gallery + Title */}
            <div className="flex flex-col gap-4 border-t border-black pt-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold font-sans text-black">
                {event.gallery.name}
              </span>
              <h1 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light text-black leading-[0.95] tracking-tight">
                {event.title}
              </h1>
            </div>

            {/* Dates */}
            <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold font-sans text-black">
                Dates
              </span>
              <p className="text-[13px] font-sans text-neutral-700 mt-1">
                {new Date(event.start_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-sans text-neutral-400">
                through
              </p>
              <p className="text-[13px] font-sans text-neutral-700">
                {new Date(event.end_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Location */}
            {(event.location?.venue || event.location?.city) && (
              <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold font-sans text-black">
                  Location
                </span>
                {event.location?.venue && (
                  <p className="text-[13px] font-sans text-neutral-700 mt-1">
                    {event.location.venue}
                  </p>
                )}
                {event.location?.city && (
                  <p className="text-[13px] font-sans text-neutral-500">
                    {event.location.city}
                    {event.location?.country
                      ? `, ${event.location.country}`
                      : ""}
                  </p>
                )}
              </div>
            )}

            {/* Booth */}
            {event.booth_number && (
              <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold font-sans text-black">
                  Booth Number
                </span>
                <p className="text-[13px] font-sans text-neutral-700 mt-1">
                  {event.booth_number}
                </p>
              </div>
            )}

            {/* Works count */}
            {event.artworks?.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold font-sans text-black">
                  Works
                </span>
                <p className="font-serif text-[4.5rem] font-light text-black tracking-tight leading-none mt-1">
                  {event.artworks.length}
                </p>
              </div>
            )}

            {/* External URL CTA */}
            {event.external_url && (
              <div className="pt-2">
                <a
                  href={event.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-black text-white font-sans text-[10px] uppercase tracking-[0.25em] font-medium px-8 py-4 hover:bg-neutral-800 transition-colors duration-150 w-full text-center"
                >
                  Enter Viewing Room
                </a>
              </div>
            )}
          </div>

          {/* ── Right: editorial description ── */}
          <div className="lg:col-span-8 border-t border-black pt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold font-sans text-black mb-10">
              Curatorial Statement
            </p>
            <p className="font-serif text-[clamp(1.2rem,2vw,1.3rem)] font-light text-neutral-800 leading-[1.75]">
              {displayedDesc}
            </p>
            {isLongDesc && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-8 inline-flex items-center gap-3 group"
              >
                <span className="text-[10px] uppercase tracking-[0.25em] font-medium font-sans text-neutral-400 group-hover:text-black transition-colors duration-200">
                  {descExpanded ? "Show Less" : "Continue Reading"}
                </span>
                <span
                  className={`text-neutral-400 group-hover:text-black transition-all duration-300 text-xs inline-block ${
                    descExpanded ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Full-width rule */}
      <div className="w-full h-px bg-neutral-50" />
    </>
  );
};
