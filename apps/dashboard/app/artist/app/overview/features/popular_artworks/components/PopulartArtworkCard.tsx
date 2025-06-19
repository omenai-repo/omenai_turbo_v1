import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
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
  const image_url = getImageFileView(url, 100);
  return (
    <div className="flex justify-between items-center px-5 py-3 rounded ring-1 ring-dark/10 shadow-sm">
      <div className=" w-auto flex items-center gap-x-3">
        <Image
          src={image_url}
          alt={title}
          height={60}
          width={60}
          className="object-top h-[60px] w-[60px] rounded-lg"
        />
        <div className="flex flex-col gap-y-1">
          <p className="text-dark font-normal text-fluid-xxs sm:text-fluid-xs">
            {title}
          </p>
          <span className="text-dark text-fluid-xxs">{artist}</span>
        </div>
      </div>
      <div className="w-fit">
        <span className="text-dark text-fluid-xxs">
          {`${impression_count} impressions`}
        </span>
      </div>
    </div>
  );
}
