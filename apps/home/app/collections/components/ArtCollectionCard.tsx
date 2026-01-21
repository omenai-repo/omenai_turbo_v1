"use client";

import { ArtworkMediumTypes } from "@omenai/shared-types";
import { encodeMediumForUrl } from "@omenai/shared-utils/src/encodeMediumUrl";
import Image from "next/image";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";

export default function ArtCollectionCard({
  title,
  url,
  index,
}: {
  title: ArtworkMediumTypes;
  url: string;
  index: number;
}) {
  return (
    <Link
      href={`/collections/${encodeMediumForUrl(title)}`}
      className="group block w-full cursor-pointer"
    >
      <article className="flex flex-col gap-4">
        {/* 1. IMAGE FRAME */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded bg-neutral-100 shadow-sm transition-all duration-300 group-hover:shadow-lg">
          <Image
            width={600}
            height={800}
            src={`/images/${url}.png`}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Hover Overlay: Darken slightly to make text/icon pop if needed */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

          {/* Floating Action Button (Bottom Right) */}
          <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-dark  shadow-md">
              <MdArrowRightAlt className="text-xl" />
            </div>
          </div>
        </div>

        {/* 2. METADATA */}
        <div className="flex flex-col gap-1 px-1">
          <h3 className="font-serif text-xl text-dark  leading-tight group-hover:underline">
            {title}
          </h3>
          <p className="font-sans text-xs font-medium text-neutral-500 uppercase tracking-wide">
            Explore Collection
          </p>
        </div>
      </article>
    </Link>
  );
}
