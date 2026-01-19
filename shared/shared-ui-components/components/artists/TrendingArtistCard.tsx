import Link from "next/link";
import Image from "next/image";
import React from "react";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import { base_url } from "@omenai/url-config/src/config";
import { MdNorthEast } from "react-icons/md"; // Simple directional arrow

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
  // Use a slightly larger thumbnail for the portrait ratio
  const image_href = getOptimizedImage(url, "medium", 40);
  const base_uri = base_url();

  return (
    <Link
      href={`${base_uri}/artists/?id=${artist_id}&url=${url}&artist=${artist}`}
      className="group block h-full w-full cursor-pointer"
    >
      {/* CONTAINER: 
         - Sharp corners (rounded-none)
         - Transparent border by default, turns Black on hover
         - 'bg-white' to ensure the matte effect works 
      */}
      <article className="relative flex h-full flex-col bg-white p-4 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-neutral-200/50">
        {/* IMAGE FRAME: 3:4 Aspect Ratio (Portrait) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
          <Image
            src={image_href}
            alt={artist}
            fill
            loading="lazy"
            quality={90}
            className="object-cover transition-all duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 grayscale group-hover:grayscale-0"
          />

          {/* OVERLAY: Minimalist border on top of image for definition */}
          <div className="absolute inset-0 border border-black/5 transition-colors duration-500 group-hover:border-transparent" />
        </div>

        {/* METADATA SECTION */}
        <div className="mt-5 flex flex-col justify-between gap-4">
          {/* Top Row: Name & Arrow */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif text-xl italic leading-none text-neutral-900 decoration-neutral-300 decoration-1 underline-offset-4 transition-all group-hover:underline">
              {artist}
            </h3>

            {/* Hover Arrow Interaction */}
            <span className="flex h-6 w-6 items-center justify-center text-neutral-300 transition-colors duration-300 group-hover:text-dark">
              <MdNorthEast className="text-lg" />
            </span>
          </div>

          {/* Bottom Row: Technical Data */}
          <div className="flex items-end justify-between border-t border-neutral-100 pt-3">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">
                Origin
              </span>
              <p className="font-sans text-xs font-medium text-neutral-600">
                {country}, {birthyear}
              </p>
            </div>

            {/* "Likes" converted to "Following" metric */}
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">
                Likes
              </span>
              <p className="font-mono text-xs text-neutral-900">{likes}</p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
