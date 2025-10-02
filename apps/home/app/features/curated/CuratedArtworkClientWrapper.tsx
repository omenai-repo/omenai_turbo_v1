"use client";
import { useQuery } from "@tanstack/react-query";
import CuratedArtworksLayout from "./CuratedArtworksLayout";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import { fetchCuratedArtworks } from "@omenai/shared-services/artworks/fetchedCuratedArtworks";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function CuratedArtworkClientWrapper({
  sessionId,
}: {
  sessionId: string | undefined;
}) {
  const { user } = useAuth({ requiredRole: "user" });
  const { data: userCuratedArtworks, isLoading } = useQuery({
    queryKey: ["curated"],
    queryFn: async () => {
      const data = await fetchCuratedArtworks(1, user.preferences);
      if (data?.isOk) return data.data;
      else throw new Error("Something went wrong");
    },
    staleTime: 30 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if we have cached data
  });

  if (isLoading)
    return <SectionLoaderContainers title="Based on your preferences" />;
  return (
    <>
      {/*  */}
      <div className="flex md:flex-row flex-col gap-4 mt-16">
        <div className="flex justify-between items-center w-full my-5">
          <div>
            <p className="text-fluid-xs font-normal text-dark border-b border-dark/20 pb-1 my-5 w-fit">
              Just for you
            </p>
            <p className="text-fluid-base sm:text-fluid-md font-semibold text-[#000000] mt-[20px]">
              Art based off <br /> your preferences.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <p className="text-fluid-base font-semibold">Your Art, Your Way:</p>
            <p className="justify-self-end font-normal leading-snug text-fluid-xs">
              Discover Captivating Pieces{" "}
            </p>
            <p className="justify-self-end font-normal leading-snug text-fluid-xs">
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
