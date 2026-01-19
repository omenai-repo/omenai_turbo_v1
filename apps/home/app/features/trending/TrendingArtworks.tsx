"use client";
import TrendingArtworkCard from "./TrendingArtCard";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect, useCallback } from "react";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useWindowSize } from "usehooks-ts";
import { IoIosArrowRoundForward } from "react-icons/io";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";

export default function TrendingArtworks({
  sessionId,
  artworks,
}: {
  artworks: any;
  sessionId: string | undefined;
}) {
  const { width } = useWindowSize();

  const arts = catalogChunk(
    artworks,
    width <= 640 ? 1 : width <= 990 ? 2 : width <= 1440 ? 3 : 4
  );
  return (
    <div className="max-h-[130vh] h-auto overflow-hidden relative">
      {artworks.length > 0 && (
        <div className="flex flex-wrap gap-x-4 justify-center">
          {arts.map((artworks: any[], index) => {
            return (
              <div className="flex-1 gap-2 space-y-6" key={index}>
                {artworks.map((art: any) => {
                  return (
                    <ArtworkCard
                      key={art.art_id}
                      image={art.url}
                      name={art.title}
                      artist={art.artist}
                      art_id={art.art_id}
                      pricing={art.pricing}
                      impressions={art.impressions as number}
                      likeIds={art.like_IDs as string[]}
                      sessionId={sessionId}
                      availability={art.availability}
                      medium={art.medium}
                      trending={true}
                      author_id={art.author_id}
                    />
                  );
                })}
              </div>
            );
          })}
          {/* first */}
        </div>
      )}
      <div className="absolute bottom-0 z-10 flex h-[35vh] w-full items-end justify-center pb-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />

        <Link href={"/catalog"} className="group relative z-20">
          <button className="flex items-center gap-4 bg-white px-8 py-4 text-dark transition-all duration-500 ease-out hover:bg-dark hover:text-white border border-neutral-200 hover:border-black">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]">
              Enter Full Archive
            </span>

            <IoIosArrowRoundForward className="text-2xl transition-transform duration-300 group-hover:translate-x-2" />
          </button>
        </Link>
      </div>
    </div>
  );
}
