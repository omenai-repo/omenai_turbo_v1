"use client";
import { Loader, Skeleton } from "@mantine/core";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { fetchHighlightData } from "@omenai/shared-services/overview_highlights/artist/fetchHighlightData";
import { ArtistSchemaTypes } from "@omenai/shared-types";
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
        (session as ArtistSchemaTypes).artist_id
      );
      return data;
    },
    refetchOnWindowFocus: false,
  });

  // if (isLoading) return <LoadSmall />;

  return (
    <div className="flex flex-col w-full">
      {isLoading ? (
        <div className="mt-2">
          <Loader color="rgba(255, 255, 255, 1)" size="xs" type="bars" />
        </div>
      ) : (
        <h1 className="font-semibold text-fluid-base text-white">{data}</h1>
      )}
      {/* <p className=" font-normal text-[13px] flex gap-x-1 items-center w-full whitespace-nowrap">
        <IoIosTrendingUp className="text-green-600" />{" "}
        <span className="text-green-600 font-semibold"> 9.5% </span>up from
        yesterday
      </p> */}
    </div>
  );
}
