"use client";
import { Skeleton } from "@mantine/core";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { fetchHighlightData } from "@omenai/shared-services/overview_highlights/artist/fetchHighlightData";
import { ArtistSchemaTypes } from "@omenai/shared-types";
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
        <Skeleton height={30} radius="xl" mt={6} />
      ) : (
        <h1 className="font-semibold text-base 2xl:text-sm text-gray-900">
          {data}
        </h1>
      )}
      {/* <p className=" font-normal text-[13px] flex gap-x-1 items-center w-full whitespace-nowrap">
        <IoIosTrendingUp className="text-green-600" />{" "}
        <span className="text-green-600 font-semibold"> 9.5% </span>up from
        yesterday
      </p> */}
    </div>
  );
}
