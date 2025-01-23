"use client";
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
        (session as GallerySchemaTypes).gallery_id,
        (session as GallerySchemaTypes).subscription_status.active
      );
      return data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <LoadSmall />;

  return (
    <div className="flex flex-col">
      <h4 className="font-medium text-base text-dark">{data}</h4>
      {/* <p className=" font-normal text-[13px] flex gap-x-1 items-center w-full whitespace-nowrap">
        <IoIosTrendingUp className="text-green-600" />{" "}
        <span className="text-green-600 font-semibold"> 9.5% </span>up from
        yesterday
      </p> */}
    </div>
  );
}
