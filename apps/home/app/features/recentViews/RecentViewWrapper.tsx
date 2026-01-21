"use client";

import { useQuery } from "@tanstack/react-query";
import React from "react";
import RecentViewArtworks from "./RecentViewArtworks";
import { fetchViewHistory } from "@omenai/shared-services/viewHistory/fetchViewHistory";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function RecentViewWrapper({
  sessionId,
}: {
  sessionId: string | undefined;
}) {
  const { csrf } = useAuth();

  const { data: artworks, isLoading } = useQuery({
    queryKey: ["recent_views"],
    queryFn: async () => {
      const data = await fetchViewHistory(sessionId!, csrf || "");
      if (!data?.isOk) throw new Error("Something went wrong");
      else return data.data;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) return <SectionLoaderContainers title="Loading History" />;

  // Don't render the section at all if empty
  if (!artworks || artworks.length === 0) return null;

  return <RecentViewArtworks artworks={artworks} />;
}
