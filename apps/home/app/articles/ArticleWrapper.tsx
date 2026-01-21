"use client";

import { listEditorials } from "@omenai/shared-lib/editorials/getEditorials";
import { useQuery } from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { EditorialSkeleton } from "@omenai/shared-ui-components/components/skeletons/EditorialSkeleton";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import JournalCard from "./components/JournalCard";
import FeaturedJournalEntry from "./components/FeaturedJournalEntry";
import { Models } from "appwrite";

export default function ArticleWrapper() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["fetch_admin_editorials"],
    queryFn: async () => {
      const response = await listEditorials();
      if (!response.isOk) {
        toast_notif(
          "Error fetching editorial list, please refresh or contact IT support",
          "error",
        );
        return [];
      }
      return response.data;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) return <EditorialSkeleton />;

  // Cast to ensure type safety
  const editorials = (Array.isArray(data) ? data : []) as Models.DefaultRow[];

  // LOGIC: Separate the newest story from the rest
  const featuredStory = editorials[0];
  const recentStories = editorials.slice(1);

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
      <DesktopNavbar />

      <main className="container mx-auto pb-4">
        {/* 1. MASTHEAD */}
        <header className="mb-16 border-b border-neutral-100  flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-dark  mb-3 block">
              Omenai Editorials
            </span>
            <h1 className="font-serif text-xl md:text-3xl text-dark  leading-tight">
              Perspectives
            </h1>
            <p className="mt-4 font-sans text-sm text-neutral-500 max-w-xl leading-relaxed">
              Discourse on art, ownership, and the provenance of the future.
              Featuring interviews, market analysis, and curatorial essays.
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
              <span className="h-2 w-2 bg-[#091830] rounded-full animate-pulse" />
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
