"use client";

import { ArtworkSchemaTypes } from "@omenai/shared-types";
import ArtworkCard from "@omenai/shared-ui-components/components/artworks/ArtworkCard";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { catalogChunk } from "@omenai/shared-utils/src/createCatalogChunks";
import { useWindowSize } from "usehooks-ts";

type SearchResultDetailsProps = {
  data: (Pick<
    ArtworkSchemaTypes,
    | "art_id"
    | "artist"
    | "pricing"
    | "title"
    | "url"
    | "impressions"
    | "like_IDs"
    | "medium"
    | "rarity"
    | "availability"
  > & { _id: string })[];
  searchTerm: string;
  sessionId: string | undefined;
  isPending: boolean;
};
export default function SearchResultDetails({
  data,
  searchTerm,
  sessionId,
  isPending,
}: SearchResultDetailsProps) {
  const { width } = useWindowSize();

  const arts = catalogChunk(
    data,
    width <= 400
      ? 1
      : width <= 768
        ? 2
        : width <= 1280
          ? 3
          : width <= 1440
            ? 4
            : 5
  );

  return (
    <div>
      {isPending ? (
        <div className="h-[80vh] w-full grid place-items-center">
          <Load />
        </div>
      ) : (
        <div className="w-full h-full">
          <div className="px-5 py-8">
            <h1 className="text-base font-normal text-gray-700">
              {data.length} result(s) found for term{" "}
              <span className="text-blue-600">&apos;{searchTerm}&apos;</span>
            </h1>
            {!data ||
              (data.length === 0 && (
                <div className="w-full h-full grid place-items-center">
                  <NotFoundData />
                </div>
              ))}
          </div>
          <hr className=" border-dark/10" />
          <div className="w-full mb-5 p-5">
            <div className="flex flex-wrap gap-x-4 justify-center">
              {arts.map((artworks: any[], index) => {
                return (
                  <div className="flex-1 gap-4 space-y-12" key={index}>
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
                          isDashboard={false}
                          medium={art.medium}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
