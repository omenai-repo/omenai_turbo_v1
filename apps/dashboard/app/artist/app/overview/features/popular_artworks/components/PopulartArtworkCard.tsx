import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
import { Heart } from "lucide-react";
import Image from "next/image";

/* eslint-disable @next/next/no-img-element */
type PopularArtworkCardProps = {
  url: string;
  title: string;
  artist: string;
  impression_count: number;
};
export default function PopulartArtworkCard({
  url,
  title,
  artist,
  impression_count,
}: PopularArtworkCardProps) {
  const image_url = getOptimizedImage(url, "thumbnail", 20);
  return (
    <div className="flex justify-between items-center px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
      <div className=" w-auto flex items-center gap-x-3">
        <Image
          src={image_url}
          alt={title}
          height={60}
          width={60}
          className="object-top h-[60px] w-[60px] rounded-xl"
        />
        <div className="flex flex-col gap-y-1">
          <p className="text-dark font-normal break-words text-fluid-xxs sm:text-fluid-xxs">
            {title}
          </p>
          <span className="text-dark text-fluid-xxs">{artist}</span>
        </div>
      </div>
      {/* <div className="w-fit">
        <span className="w-full text-dark text-fluid-xxs">
          {`${impression_count}`} <Heart absoluteStrokeWidth />
        </span>
      </div> */}
    </div>
  );
}
