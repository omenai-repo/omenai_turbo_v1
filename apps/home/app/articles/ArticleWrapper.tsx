"use client";

import { useQuery } from "@tanstack/react-query";
import { EditorialSkeleton } from "@omenai/shared-ui-components/components/skeletons/EditorialSkeleton";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import JournalCard from "./components/JournalCard";
import FeaturedJournalEntry from "./components/FeaturedJournalEntry";
import { Models } from "appwrite";
import { editorial_database } from "@omenai/appwrite-config/appwrite";

export default function ArticleWrapper() {
  const { data, isLoading } = useQuery({
    queryKey: ["fetch_editorials"],
    queryFn: async () => {
      const response = await editorial_database.listRows({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
      });

      if (response?.rows) {
        return response.rows;
      } else throw new Error("Something went wrong");
    },
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });

  if (isLoading) return <EditorialSkeleton />;

  // Cast to ensure type safety
  const editorials = (Array.isArray(data) ? data : []) as Models.DefaultRow[];

  // LOGIC: Sort by creation date descending, then separate latest from the rest
  const sorted = [...editorials].sort(
    (a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
  );
  const featuredStory = sorted[0];
  const recentStories = sorted.slice(1);

  if (editorials.length === 0)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white gap-4">
        <DesktopNavbar />
        <p className="font-sans text-sm font-medium text-neutral-400">
          The archives are currently empty.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-dark ">
      <main className=" mx-auto p-4 lg:p-8">
        {/* 1. MASTHEAD */}
        <header className="mb-16 border-b border-neutral-100  flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-dark  mb-3 block">
              Omenai Editorial
            </span>
            <h1 className="font -serif text-xl md:text-3xl text-dark  leading-tight">
              Perspectives
            </h1>
            <p className="mt-4 font-sans text-sm text-neutral-500 max-w-xl leading-relaxed">
              Interviews, market analysis, and essays exploring artists,
              collectors and the evolving art market.
            </p>
          </div>

          <div className="text-right hidden md:block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block">
              Vol. {new Date().getFullYear()}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 block mt-1">
              Issue No. {String(editorials.length).padStart(2, "0")}
            </span>
          </div>
        </header>

        {/* 2. THE COVER STORY */}
        {featuredStory && (
          <section className="mb-24">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 bg-[#091830] rounded -full animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-dark ">
                Latest Issue
              </span>
            </div>
            <FeaturedJournalEntry article={featuredStory} />
          </section>
        )}

        {/* 3. THE ARCHIVE GRID */}
        {recentStories.length > 0 && (
          <section>
            <div className="mb-10 flex items-center gap-4 border-b border-neutral-100 pb-4">
              <span className="font-sans text-sm font-bold uppercase tracking-wide text-dark ">
                Archive
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {recentStories.map((editorial, index) => (
                <JournalCard
                  key={editorial.$id}
                  article={editorial}
                  index={editorials.length - 1 - index} // Reverse index for "Vol. XX" feel
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
