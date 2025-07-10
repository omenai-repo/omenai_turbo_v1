"use client";
import { useEffect } from "react";
import ArtworkDetail from "./ArtworkDetail";
import ImageBox from "./ImageBox";
import { useQueryClient } from "@tanstack/react-query";
import { createViewHistory } from "@omenai/shared-services/viewHistory/createViewHstory";
import { ArtworkResultTypes } from "@omenai/shared-types";

import LegalComponents from "./LegalComponents";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

type ProductBoxTypes = {
  data: ArtworkResultTypes;
  sessionId: string | undefined;
};

export default function ProductBox({ data, sessionId }: ProductBoxTypes) {
  const { csrf } = useAuth();

  const queryClient = useQueryClient();
  // Make async call to update liked state in db
  useEffect(() => {
    const updateViews = async () => {
      const res = await createViewHistory(
        data.title,
        data.artist,
        data.art_id,
        sessionId!,
        data.url,
        csrf || ""
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
      <div className="grid lg:grid-cols-12 gap-6 justify-center items-start">
        {/* Image */}
        <ImageBox url={data.url} title={data.title} />

        {/* Data */}
        <div className="w-full col-span-12 lg:col-span-4 h-full">
          <ArtworkDetail data={data} sessionId={sessionId} />
          <LegalComponents />
        </div>
      </div>
    </div>
  );
}
