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

  // Track View History
  useEffect(() => {
    const updateViews = async () => {
      if (sessionId === undefined) return;

      const res = await createViewHistory(
        data.title,
        data.artist,
        data.art_id,
        sessionId,
        data.url,
        csrf || ""
      );
      if (res?.isOk) {
        queryClient.invalidateQueries({ queryKey: ["recent_views"] });
      }
    };
    updateViews();
  }, [sessionId, data, csrf, queryClient]);

  return (
    <section className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* COLUMN 1: THE ARTWORK (Sticky on Desktop) 
            Spans 7 columns for a cinematic view.
        */}
        <div className="col-span-1 lg:col-span-7 lg:sticky lg:top-32">
          <ImageBox url={data.url} title={data.title} />
        </div>

        {/* COLUMN 2: THE MANIFEST (Scrolls)
            Spans 5 columns.
        */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-10 lg:pl-8">
          <ArtworkDetail data={data} sessionId={sessionId} />
          <div className="w-full h-[1px] bg-neutral-200" />
          <LegalComponents />
        </div>
      </div>
    </section>
  );
}
