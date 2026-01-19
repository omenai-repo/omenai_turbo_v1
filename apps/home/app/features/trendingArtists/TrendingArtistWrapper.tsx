import React from "react";
import TrendingArtist from "./TrendingArtist";
import { fetchTrendingArtists } from "@omenai/shared-services/artist/fetchTrendingArtist";
import { useQuery } from "@tanstack/react-query";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import { GoArrowRight } from "react-icons/go";
import Link from "next/link";

export default function TrendingArtistWrapper() {
  const { data: artists, isLoading } = useQuery({
    queryKey: ["trending_artists"],
    queryFn: async () => {
      const data = await fetchTrendingArtists();
      if (!data?.isOk) throw new Error("Something went wrong");
      else return data.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return <SectionLoaderContainers title="Curating Artist Roster" />;

  return (
    <section className="w-full bg-white py-4">
      <div className="container mx-auto">
        {/* 1. ARCHITECTURAL HEADER 
            - Split Layout: Title on Left, Editorial on Right.
            - Anchored by a heavy top border.
        */}
        <div className="mb-20 border-t border-black pt-8">
          <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
            {/* LEFT COLUMN: The Hook */}
            <div className="max-w-4xl">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-1.5 w-1.5 bg-dark" /> {/* Square Anchor */}
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                  The Human Element
                </span>
              </div>

              <h2 className=" leading-[0.9] text-dark text-5xl md:text-6xl font-serif">
                The Architects of <br />
                <span className="italic text-neutral-400">
                  Contemporary Thought.
                </span>
              </h2>
            </div>

            {/* RIGHT COLUMN: The Context & Action */}
            <div className="flex max-w-sm flex-col justify-end gap-8 lg:pb-2">
              <p className="font-sans text-fluid-xs leading-relaxed text-neutral-500 font-light text-justify">
                Behind every masterpiece is a distinctive voice. We highlight
                the creators currently redefining the boundaries of their medium
                and capturing the attention of the world’s most discerning
                collectors.
              </p>
            </div>
          </div>
        </div>

        {/* 2. DATA DISPLAY LAYER */}
        <div className="w-full">
          {artists?.length === 0 ? (
            // Minimalist "Empty State" that mimics a blank gallery wall
            <div className="flex h-[400px] w-full flex-col items-center justify-center border border-dashed border-neutral-200 bg-neutral-50">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-2">
                Status Code: 204
              </span>
              <span className="font-serif text-xl italic text-neutral-900">
                Roster currently updating.
              </span>
            </div>
          ) : (
            // The Grid Component
            <TrendingArtist artists={artists} />
          )}
        </div>
      </div>
    </section>
  );
}
