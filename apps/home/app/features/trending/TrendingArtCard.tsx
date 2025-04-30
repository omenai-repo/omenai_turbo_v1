"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import LikeComponent from "@omenai/shared-ui-components/components/likes/LikeComponent";
import Image from "next/image";
import { getImageFileView } from "@omenai/shared-lib/storage/getImageFileView";
export default function TrendingArtworkCard({
  image,
  artist,
  name,
  impressions,
  medium,
  rarity,
  likeIds,
  sessionId,
  art_id,
  availability,
}: {
  image: string;
  artist: string;
  name: string;
  impressions: number;
  medium: string;
  rarity: string;
  likeIds: string[];
  sessionId: string | undefined;
  art_id: string;
  availability: boolean;
}) {
  const image_href = getImageFileView(image, 250);

  return (
    <div className="m-2">
      <div className="flex flex-col w-auto h-full max-h-[500px] justify-end">
        <div className="relative">
          <Link href={`/artwork/${name}`} className="relative">
            <Image
              src={image_href}
              alt={name + " image"}
              height={200}
              width={250}
              className="min-w-[220px] aspect-auto object-top object-cover cursor-pointer"
            />
          </Link>
        </div>

        <div className=" bg-[#FAFAFA] py-3 px-3">
          <div className="flex justify-between items-center">
            <p className="font-normal text-fluid-xs text-dark ">
              {name.substring(0, 20)}
              {name.length > 20 && "..."}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-normal text-[#858585] italic text-fluid-xs">
              {artist.substring(0, 20)}
              {artist.length > 20 && "..."}
            </p>
            <span className="text-fluid-xs flex gap-x-1 text-dark my-2">
              {impressions}
              <LikeComponent
                impressions={impressions}
                likeIds={likeIds}
                sessionId={sessionId}
                art_id={art_id}
              />
            </span>
          </div>

          {/* <hr className="border-dark/10 my-5" />
          <div className="flex gap-x-2 mb-2 items-center">
            <ArtworkCardTags tag={medium} />
            <ArtworkCardTags tag={rarity} />
          </div> */}
        </div>
      </div>
    </div>
  );
}
