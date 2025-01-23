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
    <div className="flex justify-between items-center px-5 py-3 rounded-lg shadow w-full">
      <div className=" flex gap-x-3">
        <Image
          src={image_url}
          alt={title}
          height={100}
          width={100}
          className="rounded-[10px] w-[100px] h-[100px]"
        />
        <div className="flex flex-col">
          <p className="text-dark font-medium text-base">{title}</p>{" "}
          <span className="text-dark text-[14px] font-medium">{artist}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-y-2 text-[14px]">
        <span className="text-dark font-medium text-[14px]">{order_date}</span>
        <span className="text-amber-600 font-medium px-2 py-1 text-[12px] rounded-full bg-amber-200/50">
          PENDING
        </span>
      </div>
    </div>
  );
}
