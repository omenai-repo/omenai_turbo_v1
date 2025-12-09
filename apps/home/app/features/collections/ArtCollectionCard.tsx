import { ArtworkMediumTypes } from "@omenai/shared-types";
import { encodeMediumForUrl } from "@omenai/shared-utils/src/encodeMediumUrl";
import Image from "next/image";
import Link from "next/link";

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
  return (
    <div className="py-4 min-w-[300px] relative group">
      <Link href={`/collections/${encodeMediumForUrl(title)}`}>
        <div className="flex flex-col">
          {/* Image Wrapper */}
          <div className="relative overflow-hidden rounded-3xl shadow-md">
            <Image
              width={300}
              height={!isCatalog ? 250 : 180}
              src={`/images/${url}.png`}
              alt={title + " image"}
              className="min-w-[300px] w-full min-h-[200px] h-[250px] object-cover object-center"
            />

            {/* Glass Badge */}
            <div className="absolute bottom-4 left-4 backdrop-blur-xl bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-white shadow-sm transition-all duration-300 group-hover:bg-white/30 group-hover:scale-[1.03]">
              <p className="text-fluid-xxs font-normal tracking-wide text-white">
                {title}
              </p>
            </div>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70 pointer-events-none"></div>
          </div>
        </div>
      </Link>
    </div>
  );
}
