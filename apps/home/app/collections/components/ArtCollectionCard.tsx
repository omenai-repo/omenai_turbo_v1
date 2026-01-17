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
  const safeSlug = encodeURIComponent(title)
    .replaceAll(/\(/g, "%28")
    .replaceAll(/\)/g, "%29");

  // Format index for that "Archive" feel (01, 02, etc.)
  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <div className="group w-full cursor-pointer">
      <Link
        href={`/collections/${encodeMediumForUrl(title)}`}
        className="block"
      >
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 border border-neutral-200">
          <Image
            width={600}
            height={800}
            src={`/images/${url}.png`} // Ensure these are high-res
            alt={title}
            className="h-full w-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
          />

          {/* OVERLAY: Title appears on hover */}
          <div className="absolute inset-0 bg-dark/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        {/* METADATA */}
        <div className="mt-6 flex flex-col gap-2 border-t border-transparent pt-4 transition-colors duration-300 group-hover:border-black">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-neutral-400">
              [ VOL. {formattedIndex} ]
            </span>
            <MdArrowRightAlt className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
          </div>

          <h3 className="font-serif text-2xl text-dark leading-tight group-hover:italic transition-all duration-300">
            {title}
          </h3>
        </div>
      </Link>
    </div>
  );
}
