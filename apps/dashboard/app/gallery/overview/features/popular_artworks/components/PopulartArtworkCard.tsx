import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
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
  const image_url = getOptimizedImage(url, "thumbnail", 40);
  return (
    <div className="flex justify-between items-center px-5 py-4 rounded-2xl border border-slate-200 shadow-sm">
      <div className=" w-auto flex items-center gap-x-3">
        <Image
          src={image_url}
          alt={title}
          height={50}
          width={50}
          className="object-top h-[50px] w-[50px] rounded-xl"
        />
        <div className="flex flex-col gap-y-1">
          <p className="text-dark font-semibold text-fluid-xxs">{title}</p>
          <span className="text-dark text-fluid-xxs font-normal">{artist}</span>
        </div>
      </div>
    </div>
  );
}
