"use client";
import { useEffect } from "react";
import ArtworkDetail from "./ArtworkDetail";
import ImageBox from "./ImageBox";
import { useQueryClient } from "@tanstack/react-query";
import { createViewHistory } from "@omenai/shared-services/viewHistory/createViewHstory";
import { ArtworkResultTypes } from "@omenai/shared-types";
import ArtistInformation from "./ArtistInformation";
import FullArtworkDetails from "./FullArtworkDetails";

type ProductBoxTypes = {
  data: ArtworkResultTypes;
  sessionId: string | undefined;
};

export default function ProductBox({ data, sessionId }: ProductBoxTypes) {
  const queryClient = useQueryClient();
  // Make async call to update liked state in db
  useEffect(() => {
    const updateViews = async () => {
      const res = await createViewHistory(
        data.title,
        data.artist,
        data.art_id,
        sessionId!,
        data.url
      );
      if (res?.isOk) {
        queryClient.invalidateQueries({ queryKey: ["recent_views"] });
      }
    };
    if (sessionId === undefined) return;
    else updateViews();
  }, []);
  return (
    <div className="">
      <div className="grid lg:grid-cols-2 gap-4 items-center">
        {/* Image */}
        <div className="h-full flex flex-col">
          <ImageBox url={data.url} title={data.title} />
        </div>

        {/* Data */}
        <div className="w-full lg:w-2/3 h-full">
          <ArtworkDetail data={data} sessionId={sessionId} />
          <FullArtworkDetails data={data} />
        </div>
      </div>
    </div>
  );
}
