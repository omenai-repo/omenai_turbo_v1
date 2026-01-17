"use client";
import Link from "next/link";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";
import { MdReplay } from "react-icons/md";

export default function RecentViewedCard({
  image,
  artist,
  name,
  art_id,
}: {
  image: string;
  artist: string;
  name: string;
  art_id: string;
}) {
  const image_href = getOptimizedImage(image, "medium");

  return (
    <Link
      href={`/artwork/${art_id}`}
      className="group block h-full w-full cursor-pointer"
    >
      {/* CONTAINER: No border radius, strict layout */}
      <article className="relative flex flex-col gap-3">
        {/* IMAGE CONTAINER */}
        {/* We use aspect-video (16:9) or aspect-[4/3] to differentiate from portrait listings */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <Image
            src={image_href}
            alt={name}
            loading="lazy"
            height={400}
            width={400}
            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
          />

          {/* REVISIT INDICATOR */}
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="bg-white/90 backdrop-blur px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-dark">
              Revisit
            </span>
          </div>
        </div>

        {/* METADATA - "The Wall Label" */}
        <div className="flex flex-col border-l border-neutral-200 pl-3 transition-colors duration-300 group-hover:border-black">
          <h3 className="font-serif text-lg italic leading-tight text-neutral-900 group-hover:underline decoration-neutral-300 underline-offset-4 decoration-1">
            {name}
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            {artist}
          </p>
        </div>
      </article>
    </Link>
  );
}
