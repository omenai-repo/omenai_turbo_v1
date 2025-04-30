"use client";
import { Loader, Skeleton } from "@mantine/core";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { fetchHighlightData } from "@omenai/shared-services/overview_highlights/fetchHighlightData";
import { GallerySchemaTypes } from "@omenai/shared-types";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";

import { IoIosTrendingUp } from "react-icons/io";
import { IoIosTrendingDown } from "react-icons/io";

type HightlightCardProps = {
  title: string;
  icon: React.ReactNode;
  tag: string;
};
export default function HighlightCard({ tag }: HightlightCardProps) {
  const { session } = useContext(SessionContext);
  const { data, isLoading } = useQuery({
    queryKey: [`highlight`, tag],
    queryFn: async () => {
      const data = await fetchHighlightData(
        tag,
        (session as GallerySchemaTypes).gallery_id
      );
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
        <h1 className="font-semibold text-base text-white">{data}</h1>
      )}
    </div>
  );
}
