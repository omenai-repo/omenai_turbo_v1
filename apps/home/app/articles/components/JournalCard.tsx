"use client";
import Image from "next/image";
import Link from "next/link";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";
import { Models } from "appwrite";

export default function JournalCard({
  article,
  index,
}: {
  article: Models.DefaultRow;
  index: number;
}) {
  const image_href = getEditorialFileView(article.cover, 600);
  const formattedIndex = String(index).padStart(3, "0");

  return (
    <Link
      href={`/articles/${article.slug}?id=${article.$id}`}
      className="group block h-full w-full"
    >
      <article className="flex h-full flex-col gap-4">
        {/* 1. IMAGE */}
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm bg-neutral-100 shadow-sm transition-all duration-300 group-hover:shadow-md">
          <Image
            src={image_href}
            alt={article.headline}
            fill
            className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
        </div>

        {/* 2. METADATA */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2 mb-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              Vol. {formattedIndex}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
              {article.date ? formatISODate(article.date) : "Archive"}
            </span>
          </div>

          <h3 className="font-serif text-xl text-dark  leading-tight group-hover:underline decoration-neutral-300 underline-offset-4 line-clamp-2">
            {article.headline}
          </h3>

          <p className="font-sans text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>
      </article>
    </Link>
  );
}
