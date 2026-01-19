"use client";
import { useQuery } from "@tanstack/react-query";
import ExhibitionGrid from "./CuratedArtworksLayout"; // Using the new Grid
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import { fetchCuratedArtworks } from "@omenai/shared-services/artworks/fetchedCuratedArtworks";
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
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading)
    return <SectionLoaderContainers title="Assembling Private View" />;

  return (
    <section className="w-full bg-white py-8">
      <div className="container mx-auto">
        {/* 1. HEADER: The "Private View" Statement */}
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-[1px] w-8 bg-dark" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                Private View
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-dark">
              Curated for <br />
              <span className="italic text-neutral-500">
                The Discerning Eye.
              </span>
            </h2>
          </div>

          <div className="flex max-w-xs flex-col gap-4 text-right md:items-end">
            <p className="font-sans text-xs leading-relaxed text-neutral-500">
              A collection of works selected specifically to resonate with your
              established preferences in.
            </p>
          </div>
        </div>

        {/* 2. THE EXHIBITION */}
        {userCuratedArtworks!.length === 0 ? (
          <div className="flex h-[400px] w-full flex-col items-center justify-center bg-neutral-50">
            <h3 className="font-serif text-2xl italic text-neutral-400">
              Curating selection...
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-300">
              Please check back shortly
            </p>
          </div>
        ) : (
          <ExhibitionGrid
            sessionId={sessionId}
            userCuratedArtworks={userCuratedArtworks}
          />
        )}
      </div>
    </section>
  );
}
