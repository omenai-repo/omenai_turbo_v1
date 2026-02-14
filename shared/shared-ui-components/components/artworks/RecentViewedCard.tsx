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
      className="group block h-full w-full cursor-pointer"
    >
      <article className="relative flex flex-col gap-2">
        {/* IMAGE: Rounded, Shadow */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-neutral-100 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
          <Image
            src={image_href}
            alt={name}
            loading="lazy"
            height={400}
            width={400}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        {/* METADATA: Simple & Clean */}
        <div className="flex flex-col px-1">
          <h3 className="font-serif text-sm font-medium text-dark  truncate group-hover:underline underline-offset-4 decoration-neutral-300">
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
