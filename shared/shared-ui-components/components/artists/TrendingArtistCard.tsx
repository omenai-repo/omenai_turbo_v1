import Link from "next/link";
import Image from "next/image";
import React from "react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { base_url } from "@omenai/url-config/src/config";
import { MdNorthEast, MdFavorite } from "react-icons/md";

export function TrendingArtistCard({
  url,
  artist,
  likes,
  birthyear,
  country,
  artist_id,
}: {
  url: string;
  artist: string;
  likes: string;
  birthyear: string;
  country: string;
  artist_id: string;
}) {
  const image_href = getOptimizedImage(url, "medium", 40);
  const base_uri = base_url();

  return (
    <Link
      href={`${base_uri}/artists/?id=${artist_id}&url=${url}&artist=${artist}`}
      className="group block h-full w-full cursor-pointer"
    >
      <article className="flex flex-col gap-4">
        {/* IMAGE FRAME: Removed grayscale, added rounding */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-neutral-100 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
          <Image
            src={image_href}
            alt={artist}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Subtle gradient at bottom for potential white text overlay if needed, 
              but mostly just to add depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* METADATA SECTION */}
        <div className="flex flex-col gap-1">
          {/* Name & Arrow */}
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-dark  leading-tight group-hover:underline decoration-neutral-300 underline-offset-4">
              {artist}
            </h3>
            <MdNorthEast className="text-neutral-300 transition-colors group-hover:text-dark " />
          </div>

          {/* Location & Stats */}
          <div className="flex items-center justify-between mt-1">
            <p className="font-sans text-xs font-medium text-neutral-500">
              {country}
            </p>

            {/* Likes Badge */}
            <div className="flex items-center gap-1.5 bg-neutral-100 px-2 py-0.5 rounded-full">
              <MdFavorite className="text-xs text-dark " />
              <span className="font-sans text-[10px] font-bold text-dark ">
                {likes}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
