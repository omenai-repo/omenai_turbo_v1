"use client";
import Image from "next/image";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import { Models } from "appwrite";
import { formatISODate } from "@omenai/shared-utils/src/formatISODate";

export default function FeaturedJournalEntry({
  article,
}: {
  article: Models.DefaultRow;
}) {
  // High-res image for the hero
  const image_href = getEditorialFileView(article.cover, 1200);

  return (
    <div className="group w-full cursor-pointer">
      <Link href={`/articles/${article.slug}?id=${article.$id}`}>
        <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* IMAGE COLUMN (Dominant) */}
          <div className="lg:col-span-8 w-full">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-neutral-100 shadow-sm transition-all duration-500 group-hover:shadow-md">
              <Image
                src={image_href}
                alt={article.headline}
                fill
                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* CONTENT COLUMN */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <span className="font-mono text-[10px] text-neutral-400 mb-4 block">
              {article.date ? formatISODate(article.date) : "Today"}
            </span>

            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-dark  leading-[1.1] mb-6 group-hover:underline decoration-neutral-300 underline-offset-8">
              {article.headline}
            </h2>

            <p className="font-sans text-sm md:text-base leading-relaxed text-neutral-500 mb-8 line-clamp-4">
              {article.summary ||
                "Explore the full story in our latest editorial feature..."}
            </p>

            <span className="inline-flex items-center gap-3 font-sans text-xs font-bold uppercase tracking-widest text-dark ">
              Read Feature
              <span className="bg-[#091830] text-white rounded-full p-1 transition-transform duration-300 group-hover:translate-x-2">
                <MdArrowRightAlt className="text-lg" />
              </span>
            </span>
          </div>
        </article>
      </Link>
    </div>
  );
}
