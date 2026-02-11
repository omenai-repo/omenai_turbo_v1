"use client";
import { useQuery } from "@tanstack/react-query";
import ExhibitionGrid from "./CuratedArtworksLayout";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import { fetchCuratedArtworks } from "@omenai/shared-services/artworks/fetchedCuratedArtworks";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";
import { MdRecommend } from "react-icons/md";

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

  if (isLoading) return <SectionLoaderContainers title="Personalizing Feed" />;

  return (
    <section className="w-full bg-[#f5f5f5] py-8 border-t border-neutral-200">
      <div className="px-4 lg:px-12">
        {/* 1. MARKETPLACE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#091830]/10 text-dark ">
                <MdRecommend size={14} />
              </span>
              <span className="text-xs font-sans font-bold text-dark  tracking-wide uppercase">
                For You
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif text-dark ">
              Your Personal Edits
            </h2>
            <p className="mt-2 font-sans text-sm text-neutral-500 max-w-lg">
              Works selected from your chosen interests
            </p>
          </div>

          <div className="hidden md:block">
            <Link
              href="/catalog"
              className="group flex items-center gap-2 text-sm font-sans font-medium text-neutral-500 hover:text-dark  transition-colors"
            >
              Browse Full Catalog
              <IoArrowForward className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 2. THE GRID */}
        {userCuratedArtworks!.length === 0 ? (
          <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-100">
            <span className="font-sans text-neutral-400">
              Curating your selection...
            </span>
          </div>
        ) : (
          <ExhibitionGrid
            sessionId={sessionId}
            userCuratedArtworks={userCuratedArtworks}
          />
        )}

        {/* Mobile View All */}
        <div className="mt-12 flex md:hidden justify-center">
          <Link
            href="/catalog"
            className="w-full py-3 text-center rounded-md border border-neutral-200 text-sm font-sans font-medium text-neutral-800 bg-white shadow-sm"
          >
            Browse Full Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
