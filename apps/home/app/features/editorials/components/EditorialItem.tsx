import { getEditorialFileView } from "@omenai/shared-lib/storage/getEditorialCoverFileView";
import Image from "next/image";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";

export type EditorialItemProps = {
  title: string;
  date: string;
  minutes: string;
  cover: string;
  summary: string;
  $id: string;
  link: string;
};

export default function EditorialItem({
  title,
  date,
  minutes,
  cover,
  summary,
  link,
}: EditorialItemProps) {
  const url = cover ? getEditorialFileView(cover) : null;
  const href = link.startsWith("http") ? link : `https://${link}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full w-full max-w-[400px] cursor-pointer bg-white"
    >
      {/* OUTER FRAME: Strict 1px border that darkens on hover */}
      <article className="flex h-full flex-col border border-neutral-200 transition-colors duration-500 ease-out group-hover:border-black">
        {/* IMAGE SECTION: Rigid Grid Row */}
        <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-neutral-200 bg-neutral-100">
          {url ? (
            <Image
              src={url}
              alt={title}
              fill
              className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-50">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                Figure Absent
              </span>
            </div>
          )}

          {/* Flash Overlay: A subtle white flash on hover instead of shadow */}
          <div className="absolute inset-0 z-10 bg-white opacity-0 transition-opacity duration-500 group-hover:opacity-10" />
        </div>

        {/* CONTENT SECTION */}
        <div className="flex flex-1 flex-col justify-between p-6">
          <div className="flex flex-col gap-4">
            {/* METADATA ROW: Technical / High Tracking */}
            <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              <span>{date}</span>
              <span className="h-[1px] w-4 bg-neutral-300" />
              <span>{minutes}</span>
            </div>

            {/* TITLE: Serif Italic / Emotive */}
            <h2 className="font-serif text-2xl font-light italic leading-[1.15] text-dark group-hover:underline group-hover:decoration-neutral-300 group-hover:underline-offset-4 decoration-1 transition-all">
              {title}
            </h2>

            {/* SUMMARY: Clean Sans / High Legibility */}
            <p className="line-clamp-3 font-sans text-sm leading-relaxed text-neutral-600">
              {summary}
            </p>
          </div>

          {/* FOOTER: Minimalist "Go" Action */}
          <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-dark opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Read Entry
            </span>
            <div className="flex h-8 w-8 items-center justify-center border border-transparent transition-all duration-300 group-hover:border-neutral-200">
              <MdArrowRightAlt className="-ml-1 text-xl text-neutral-400 transition-colors duration-300 group-hover:text-dark" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
