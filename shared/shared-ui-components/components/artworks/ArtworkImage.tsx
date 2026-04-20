"use client";
/* eslint-disable @next/next/no-img-element */

import { formatPrice } from "@omenai/shared-utils/src/priceFormatter";
import Link from "next/link";
import { getOptimizedImage } from "@omenai/shared-lib/storage/getImageFileView";
import LikeComponent from "../likes/LikeComponent";
type ArtworkImageProps = {
  url: string;
  title: string;
  author: string;
  impressions: number;
  likeIds: string[];
  sessionId: string | undefined;
  art_id: string;
  pricing?: {
    price: number;
    usd_price: number;
    shouldShowPrice: "Yes" | "No" | string;
  };
};

export const ArtworkImage = ({
  url,
  title,
  author,
  impressions,
  likeIds,
  sessionId,
  art_id,
  pricing,
}: ArtworkImageProps) => {
  const image_href = getOptimizedImage(url, "thumbnail", 40);

  return (
    <Link href={`/artwork/${title}`} className="w-[250px]">
      <div className="relative flex items-end max-w-[250px] w-fit rounded mb-4">
        {pricing?.price ? (
          <div className="absolute top-4 right-4 z-10 p-1 rounded bg-white border-dark/10 grid place-items-center">
            <LikeComponent
              impressions={impressions}
              likeIds={likeIds}
              sessionId={sessionId}
              art_id={art_id}
            />
          </div>
        ) : null}
        <img
          src={image_href}
          alt="artwork"
          loading="lazy"
          className="w-fit max-w-[250px] rounded"
        />

        <div className="absolute bottom-0 flex justify-between items-center gap-y-[0.1rem] text-white px-2 py-4 z-10 bg-dark/30 w-full rounded cursor-pointer">
          <div className="flex-col flex gap-y-[0.1rem]">
            <span className="font-normal text-fluid-xxs ">{title}</span>
            <span className="text-fluid-xxs text-[#fafafa] ">{author}</span>
          </div>

          {pricing?.price ? (
            pricing?.price && pricing.shouldShowPrice === "Yes" ? (
              <span className="font-normal text-fluid-xxs text-white">
                {formatPrice(pricing.usd_price)}
              </span>
            ) : (
              <span className=" font-normal text-fluid-xxs">
                Price on request
              </span>
            )
          ) : null}
        </div>
      </div>
    </Link>
  );
};
