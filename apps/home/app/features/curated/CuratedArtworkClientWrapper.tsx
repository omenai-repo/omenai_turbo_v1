"use client";
import { useQuery } from "@tanstack/react-query";
import CuratedArtworksLayout from "./CuratedArtworksLayout";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";
import { useContext } from "react";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { fetchCuratedArtworks } from "@omenai/shared-services/artworks/fetchedCuratedArtworks";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";

export default function CuratedArtworkClientWrapper({
  sessionId,
}: {
  sessionId: string | undefined;
}) {
  const { session } = useContext(SessionContext);
  const { data: userCuratedArtworks, isLoading } = useQuery({
    queryKey: ["curated"],
    queryFn: async () => {
      const data = await fetchCuratedArtworks(
        1,
        (session as IndividualSchemaTypes)?.preferences
      );
      if (data?.isOk) return data.data;
      else throw new Error("Something went wrong");
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading)
    return <SectionLoaderContainers title="Based on your preferences" />;
  return (
    <>
      <div className="flex md:flex-row flex-col gap-4 my-5">
        <div className="space-y-1 flex-1">
          <h1 className="text-sm md:text-md font-normal">
            Based on your preferences
          </h1>
          <p className="text-base md:text-sm text-[#858585] font-light italic">
            Your Art, Your Way: Explore Pieces That Resonate with You
          </p>
        </div>
        <Link
          href={"/categories/curated-artworks"}
          className="text-dark flex items-center gap-x-2 font-normal text-[14px] break-words"
        >
          View all
          <MdArrowRightAlt />
        </Link>
      </div>
      {userCuratedArtworks!.length === 0 && (
        <div className="h-[500px] w-full place-items-center grid">
          <NotFoundData />
        </div>
      )}
      <div className="bg-[#fafafa] relative">
        <div className="relative z-20 py-8">
          <CuratedArtworksLayout
            sessionId={sessionId}
            userCuratedArtworks={userCuratedArtworks}
          />
        </div>
      </div>
    </>
  );
}
