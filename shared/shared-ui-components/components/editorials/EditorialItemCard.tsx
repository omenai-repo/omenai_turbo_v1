import { Image as ImageIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { base_url } from "@omenai/url-config/src/config";
import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";

// We define the type exactly as you requested, plus the $id needed for the link
type EditorialSchemaTypes = {
  headline: string;
  summary?: string;
  cover: string;
  date: Date | null;
  content: string;
  slug: string;
  $id?: string; // Included to satisfy the link requirement
};

export default function EditorialItemCard({
  editorial,
}: {
  editorial: EditorialSchemaTypes;
}) {
  const url = editorial.cover
    ? getEditorialFileView(editorial.cover, 600) // 600px for Retina sharpness
    : null;

  const formattedDate = editorial.date
    ? new Date(editorial.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "ARCHIVE";

  return (
    <Link
      href={`${base_url()}/articles/${editorial.slug}?id=${editorial.$id}`}
      rel="noopener noreferrer"
      className="group block h-full w-full max-w-[400px] cursor-pointer"
    >
      {/* CONTAINER: 
          - No rounded corners. 
          - Strict 1px neutral border that turns Black on hover.
          - Internal padding (p-5) to frame the content like a matte. 
      */}
      <article className="flex h-full flex-col justify-between border border-neutral-200 bg-white p-5 transition-colors duration-500 hover:border-black">
        {/* HEADER: Technical Metadata (The "File Number" look) */}
        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            {formattedDate}
          </span>
          {/* Aesthetic Anchor Point */}
          <div className="h-1 w-1 bg-neutral-200 transition-colors duration-300 group-hover:bg-dark" />
        </div>

        {/* IMAGE SECTION: 
            - 3:4 Aspect Ratio (Standard Portrait/Editorial ratio).
            - Grayscale by default -> Full Color on hover.
            - Slow zoom effect.
        */}
        <div className="relative mb-6 aspect-[3/4] w-full overflow-hidden bg-neutral-50">
          {url ? (
            <Image
              src={url}
              alt={editorial.headline}
              fill
              className="object-cover transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 grayscale group-hover:grayscale-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <div className="flex flex-col items-center gap-2">
                <ImageIcon strokeWidth={1} className="h-8 w-8" />
                <span className="font-mono text-[9px] uppercase tracking-widest">
                  No Plate
                </span>
              </div>
            </div>
          )}
          {/* Subtle Flash Overlay */}
          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-overlay" />
        </div>

        {/* TYPOGRAPHY SECTION */}
        <div className="flex flex-col gap-3">
          {/* TITLE: Serif Italic + Large + High Contrast */}
          <h1 className="font-serif text-2xl font-light italic leading-[1.15] text-neutral-900 decoration-neutral-300 decoration-1 underline-offset-4 transition-all group-hover:underline">
            {editorial.headline}
          </h1>

          {/* SUMMARY: Sans-Serif + Neutral Grey */}
          {editorial.summary && (
            <p className="line-clamp-2 font-sans text-xs leading-relaxed text-neutral-500">
              {editorial.summary}
            </p>
          )}
        </div>

        {/* FOOTER: The "Hidden" Action 
            - Only reveals "Read Article" on hover to keep the resting state clean.
        */}
        <div className="mt-8 flex items-center justify-end overflow-hidden border-t border-transparent pt-3 transition-colors group-hover:border-neutral-100">
          <div className="flex translate-y-4 items-center gap-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-900">
              Read Article
            </span>
            <ArrowRight className="h-3 w-3 text-neutral-900" />
          </div>
        </div>
      </article>
    </Link>
  );
}
