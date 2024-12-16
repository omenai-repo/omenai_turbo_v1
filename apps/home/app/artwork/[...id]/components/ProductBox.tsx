"use client";
import { useEffect } from "react";
import ArtworkDetail from "./ArtworkDetail";
import ImageBox from "./ImageBox";
import { useQueryClient } from "@tanstack/react-query";
import { createViewHistory } from "@omenai/shared-services/viewHistory/createViewHstory";
import { ArtworkResultTypes } from "@omenai/shared-types";

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
    <div className=" p-3 xl:p-[1.5rem] my-5">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="h-full grid place-items-center md:justify-self-end">
          <ImageBox
            url={data.url}
            title={data.title}
            availability={data.availability}
          />
        </div>

        {/* Data */}
        <div className="w-full lg:w-2/3 h-full">
          <ArtworkDetail data={data} sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
}
