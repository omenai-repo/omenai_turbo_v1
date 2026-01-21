"use client";

import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { HiOutlineEmojiSad } from "react-icons/hi";

export default function NotFoundSearchResult() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("searchTerm");

  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
      {/* Text Content */}
      <div className="text-center max-w-md space-y-4">
        <h1 className="font-serif text-2xl md:text-3xl text-dark ">
          No results for{" "}
          <span className="italic text-neutral-500">“{searchTerm}”</span>
        </h1>

        <p className="font-sans text-sm text-neutral-500 leading-relaxed">
          We couldn&apos;t find any artworks matching your search. Try checking
          for typos or using broader keywords.
        </p>

        {/* Action Button */}
        <div className="pt-4">
          <Link
            href="/catalog"
            className="inline-block border-b border-[#091830] pb-0.5 font-sans text-xs font-bold uppercase tracking-widest text-dark  hover:text-neutral-500 hover:border-neutral-500 transition-colors"
          >
            Browse Full Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
