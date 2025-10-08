"use client";
import {
  getImageFileView,
  getOptimizedImage,
} from "@omenai/shared-lib/storage/getImageFileView";
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
  const image_url = getOptimizedImage(url, "thumbnail", 40);

  return (
    <div className="flex justify-between items-center px-5 py-3 rounded shadow w-full">
      <div className=" flex gap-x-3">
        <Image
          src={image_url}
          alt={title}
          height={100}
          width={100}
          className="rounded w-[100px] h-[100px]"
        />
        <div className="flex flex-col">
          <p className="text-dark font-medium text-fluid-base">{title}</p>{" "}
          <span className="text-dark text-fluid-xxs font-medium">{artist}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-y-2 text-fluid-xxs">
        <span className="text-dark font-medium text-fluid-xxs">
          {order_date}
        </span>
        <span className="text-amber-600 font-medium px-2 py-1 text-[12px] rounded bg-amber-200/50">
          PENDING
        </span>
      </div>
    </div>
  );
}
