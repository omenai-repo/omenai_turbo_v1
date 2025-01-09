"use client";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
import Image from "next/image";

type OverviewOrdersCardProps = {
  title: string;
  artist: string;
  order_date: string;
  url: string;
  status: string;
};
export default function OverviewOrdersCard({
  title,
  artist,
  order_date,
  url,
  status,
}: OverviewOrdersCardProps) {
  const image_url = getImageFileView(url, 200);

  return (
    <div className="flex justify-between items-center px-5 py-3 rounded-lg ring-1 ring-[#eeeeee] shadow-sm w-full">
      <div className=" flex gap-x-3">
        <Image
          src={image_url}
          alt={title}
          height={100}
          width={80}
          className="object-top object-contain"
        />
        <div className="flex flex-col">
          <p className="text-dark font-normal text-base">{title}</p>
          <span className="text-dark text-xs font-light">{artist}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-y-2 text-xs">
        <span className="text-dark text-xs">{order_date}</span>
        <span className="text-dark font-normal px-2 py-1 text-[12px] rounded-full bg-amber-200">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
}
