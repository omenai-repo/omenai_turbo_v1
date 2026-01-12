"use client";
import { Loader } from "@mantine/core";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchHighlightData } from "@omenai/shared-services/overview_highlights/artist/fetchHighlightData";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type HightlightCardProps = {
  title: string;
  icon: React.ReactNode;
  tag: string;
};

export default function HighlightCard({ tag, title }: HightlightCardProps) {
  const { user } = useAuth({ requiredRole: "artist" });
  const { data, isLoading } = useQuery({
    queryKey: [`highlight`, tag],
    queryFn: async () => {
      const data = await fetchHighlightData(tag, user.artist_id);
      return data;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-fluid-xxs text-neutral-500">{title.toUpperCase()}</p>

        <div className="mt-2 flex items-baseline justify-between">
          {isLoading ? (
            <Loader color="#0f172a " size="xs" type="bars" />
          ) : (
            <h3 className="text-fluid-sm font-semibold tracking-tight">
              {data}
            </h3>
          )}

          {/* {item.delta && (
              <span className="text-sm font-medium text-emerald-600">
                {item.delta}
              </span>
            )} */}
        </div>
      </div>
    </>
  );
}
