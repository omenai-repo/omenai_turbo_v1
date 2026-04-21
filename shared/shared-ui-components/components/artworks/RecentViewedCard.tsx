"use client";
import Link from "next/link";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";

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
      className="group/recent block h-full w-full max-w-[320px] mx-auto cursor-pointer"
    >
      <article className="relative flex flex-col gap-2">
        {/* IMAGE: Rounded, Shadow */}
        <div className="relative h-[350px] w-full overflow-hidden rounded-sm shadow-sm transition-shadow duration-300 group-hover/recent:shadow-md">
          <Image
            src={image_href}
            alt={name}
            loading="lazy"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            // Replaced object-cover with object-contain & object-bottom
            className="object-contain object-bottom transition-transform duration-500 ease-out group-hover/recent:scale-105"
          />
        </div>

        {/* METADATA: Simple & Clean */}
        <div className="flex flex-col px-1">
          {/* Fixed font-serif typo and applied named group hover */}
          <h3 className="font-serif text-sm font-medium text-dark truncate group-hover/recent:underline underline-offset-4 decoration-neutral-300">
            {name}
          </h3>
          <p className="font-sans text-xs text-neutral-500 truncate">
            {artist}
          </p>
        </div>
      </article>
    </Link>
  );
}
