"use client";

import { ArtworkMediumTypes } from "@omenai/shared-types";
import { encodeMediumForUrl } from "@omenai/shared-utils/src/encodeMediumUrl";
import Image from "next/image";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";

type ArtCollectionCardTypes = {
  title: ArtworkMediumTypes;
  url: string;
  isCatalog?: boolean;
};

export default function ArtCollectionCard({
  title,
  url,
  isCatalog,
}: ArtCollectionCardTypes) {
  // NOTE: I removed Math.random() to prevent Next.js Hydration Errors.
  // In a real app, you might pass an 'index' prop if you want specific numbers.

  return (
    <Link
      href={`/collections/${encodeMediumForUrl(title)}`}
      className="group block h-full w-full cursor-pointer"
    >
      <article className="flex flex-col gap-6">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-neutral-100">
          <Image
            fill
            src={`/images/${url}.png`}
            alt={title}
            className="object-cover transition-all duration-[1.5s] ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />

          {/* Active State Border (Inner) */}
          <div className="absolute inset-0 border border-black/0 transition-colors duration-500 group-hover:border-black/5" />
        </div>

        {/* 2. TYPOGRAPHY & LAYOUT */}
        <div className="flex flex-col gap-3">
          {/* Header Row: Title + Arrow Interaction */}
          <div className="flex items-start justify-between border-b border-neutral-200 pb-4 transition-colors duration-500 group-hover:border-black">
            <div>
              <h3 className="font-sans text-md leading-none text-neutral-900">
                {title}
              </h3>
            </div>

            {/* The "Slide-In" Arrow */}
            <div className="flex items-center overflow-hidden pr-2 pt-4">
              <MdArrowRightAlt className="-translate-x-full text-2xl text-dark opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
