"use client";
import Image from "next/image";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { EditorialSchemaTypes } from "@omenai/shared-types";
import { Models } from "appwrite";

export default function FeaturedJournalEntry({
  article,
}: {
  article: Models.DefaultRow;
}) {
  // Use a larger size for the featured image
  const image_href = getEditorialFileView(article.cover, 1200);

  return (
    <div className="group w-full cursor-pointer">
      <Link href={`/articles/${article.slug}?id=${article.$id}`}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* IMAGE (Dominant) */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 lg:col-span-8">
            <Image
              src={image_href}
              alt={article.headline}
              fill
              className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
              priority
            />
          </div>

          {/* CONTENT (Editorial Column) */}
          <div className="flex flex-col justify-center lg:col-span-4">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2 w-2 bg-dark rounded"></div>
              <span className="font-mono text-xs uppercase tracking-widest text-dark">
                Lead Story
              </span>
            </div>

            <h2 className="mb-6 font-serif text-4xl italic text-dark leading-[1.1] lg:text-5xl">
              {article.headline}
            </h2>

            {/* Assuming 'summary' or using a truncated body if summary isn't available */}
            <p className="mb-8 font-sans text-sm leading-relaxed text-neutral-600 line-clamp-4">
              Read the full story regarding this topic in our latest issue...
            </p>

            <span className="group/btn inline-flex items-center gap-3 border-b border-black pb-1 font-mono text-xs uppercase tracking-widest text-dark">
              Read Article
              <MdArrowRightAlt className="transition-transform duration-300 group-hover/btn:translate-x-2" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
