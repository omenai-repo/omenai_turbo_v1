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
import PreferencePicker from "./components/PreferencePicker";

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
      {/*  */}
      <div className="flex md:flex-row flex-col gap-4 mt-16">
        <div className="flex justify-between items-center w-full my-5">
          <div>
            <p className="text-base ring-1 px-3 w-fit py-1 rounded-full ring-dark font-medium text-[#000000] my-5">
              Just for you
            </p>
            <p className="text-sm sm:text-lg font-[900] text-[#000000] mt-[20px]">
              Art based off <br /> your preferences.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-[900]">Your Art, Your Way:</p>
            <p className="justify-self-end font-medium">
              Discover Captivating Pieces{" "}
            </p>
            <p className="justify-self-end font-medium">
              that truly resonates with You
            </p>
          </div>
        </div>
      </div>
      {/*  */}
      {userCuratedArtworks!.length === 0 && (
        <div className="h-[500px] w-full place-items-center grid">
          <NotFoundData />
        </div>
      )}
      <div className="relative">
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
