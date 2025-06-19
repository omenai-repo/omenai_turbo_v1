"use client";
import { Loader } from "@mantine/core";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { fetchHighlightData } from "@omenai/shared-services/overview_highlights/fetchHighlightData";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

type HightlightCardProps = {
  title: string;
  icon: React.ReactNode;
  tag: string;
};
export default function HighlightCard({ tag }: HightlightCardProps) {
  const { user } = useAuth({ requiredRole: "gallery" });
  const { data, isLoading } = useQuery({
    queryKey: [`highlight`, tag],
    queryFn: async () => {
      const data = await fetchHighlightData(tag, user.gallery_id);
      return data;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="mt-2">
          <Loader color="rgba(255, 255, 255, 1)" size="xs" type="bars" />
        </div>
      ) : (
        <h1 className="font-semibold text-fluid-base text-white">{data}</h1>
      )}
    </div>
  );
}
