"use client";
import Image from "next/image";
import Link from "next/link";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { EditorialSchemaTypes } from "@omenai/shared-types";
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
  const formattedIndex = String(index).padStart(2, "0");

  return (
    <Link
      href={`/articles/${article.slug}?id=${article.$id}`}
      className="group block h-full"
    >
      <article className="flex h-full flex-col">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            No. {formattedIndex}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">
            {article.date ? formatISODate(article.date) : "Recent"}
          </span>
        </div>

        {/* IMAGE */}
        <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          <Image
            src={image_href}
            alt={article.headline}
            fill
            className="object-cover transition-all duration-700 ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
          />
        </div>

        {/* TYPOGRAPHY */}
        <div className="flex flex-1 flex-col">
          <h3 className="mb-3 font-serif text-2xl text-dark leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2">
            {article.headline}
          </h3>
          <span className="mt-auto inline-block font-mono text-[10px] uppercase tracking-widest text-neutral-400 group-hover:text-dark transition-colors">
            Read Entry &rarr;
          </span>
        </div>
      </article>
    </Link>
  );
}
