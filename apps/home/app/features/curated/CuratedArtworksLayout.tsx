"use client";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { actionStore } from "@omenai/shared-state-store/src/actions/ActionStore";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useContext, useState } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import {
  MdArrowRightAlt,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { useWindowSize } from "usehooks-ts";
import PreferencePicker from "./components/PreferencePicker";

export default function CuratedArtworksLayout({
  sessionId,
  userCuratedArtworks,
}: {
  sessionId: string | undefined;
  userCuratedArtworks: any;
}) {
  const { width } = useWindowSize();
  const { curated_preference } = actionStore();
  const { session } = useContext(SessionContext);
  const [isFading, setIsFading] = useState(false); // Tracks the fade-out/in state

  const curated_artworks = userCuratedArtworks.filter((artwork: any) => {
    if (curated_preference === "All") return artwork;
    else return artwork.medium === curated_preference;
  });

  const arts = catalogChunk(
    curated_artworks,
    width < 640 ? 1 : width < 990 ? 2 : width < 1440 ? 3 : 4
  );
  return (
    <>
      <PreferencePicker
        setIsFading={setIsFading}
        preferences={(session as IndividualSchemaTypes).preferences}
      />
      <div
        className={`h-[180vh] sm:h-[130vh] overflow-hidden relative transition-opacity duration-300 ${
          isFading ? "opacity-10" : "opacity-100"
        }`}
      >
        {userCuratedArtworks.length > 0 && (
          <div className="flex flex-wrap gap-x-4 justify-center">
            {arts.map((artworks: any[], index) => {
              return (
                <div className="flex-1 gap-2 space-y-6" key={index}>
                  {artworks.map((art: any) => {
                    return (
                      <ArtworkCard
                        key={art.art_id}
                        image={art.url}
                        name={art.title}
                        artist={art.artist}
                        art_id={art.art_id}
                        pricing={art.pricing}
                        impressions={art.impressions as number}
                        likeIds={art.like_IDs as string[]}
                        sessionId={sessionId}
                        availability={art.availability}
                        medium={art.medium}
                        trending={false}
                      />
                    );
                  })}
                </div>
              );
            })}
            {/* first */}
          </div>
        )}
        <div className="h-[35vh] w-full absolute z-10 bottom-0 flex items-center justify-center">
          <div className="absolute w-full h-full bg-gradient-to-t from-white from-10% via-white/70 via-60% to-transparent" />
          <Link
            href={"/categories/curated-artworks"}
            className="group absolute bottom-16"
          >
            <button className="flex items-center gap-x-2  shadow-[8px_8px_0px_rgba(0,0,0,1)] group-hover:shadow-none duration-200 bg-white ring-1 ring-dark text-dark mt-10 px-8 z-20 rounded-full h-[40px]">
              See more
              <IoIosArrowRoundForward />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
