"use client";

import { listEditorials } from "@omenai/shared-lib/editorials/getEditorials";
import { useQuery } from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { EditorialSkeleton } from "@omenai/shared-ui-components/components/skeletons/EditorialSkeleton";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import JournalCard from "./components/JournalCard";
import FeaturedJournalEntry from "./components/FeaturedJournalEntry";

export default function ArticleWrapper() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["fetch_admin_editorials"],
    queryFn: async () => {
      const response = await listEditorials();
      if (!response.isOk) {
        toast_notif(
          "Error fetching editorial list, please refresh or contact IT support",
          "error"
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

  // Cast to ensure type safety based on your schema
  const editorials = Array.isArray(data) ? data : [];

  // LOGIC: Separate the newest story from the rest
  const featuredStory = editorials[0];
  const recentStories = editorials.slice(1);

  if (editorials.length === 0)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          No entries found in the archive.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-dark">
      <DesktopNavbar />

      <main className="container mx-auto px-6 lg:px-12 py-6">
        {/* 1. THE MASTHEAD */}
        <header className="mb-16 border-b border-black pb-8">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Est. 2026
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Vol. {new Date().getFullYear()}
            </span>
          </div>
          <h1 className="text-center font-serif text-[12vw] leading-[0.8] tracking-tighter text-dark lg:text-[150px]">
            THE JOURNAL
          </h1>
          <div className="mt-8 flex justify-center">
            <p className="max-w-xl text-center font-serif text-lg italic text-neutral-600">
              Discourse on art, ownership, and the provenance of the future.
            </p>
          </div>
        </header>

        {/* 2. THE LEAD STORY (Cover) */}
        {featuredStory && (
          <section className="mb-24">
            <FeaturedJournalEntry article={featuredStory} />
          </section>
        )}

        {/* 3. THE ARCHIVE (Grid) */}
        {recentStories.length > 0 && (
          <section>
            <div className="mb-12 flex items-center gap-4 pt-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-dark">
                Recent Publications
              </span>
              <div className="h-[1px] flex-1 bg-neutral-200"></div>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
              {recentStories.map((editorial, index) => (
                <div
                  key={editorial.slug}
                  className="border-r border-transparent md:border-neutral-100 md:pr-8 last:border-none"
                >
                  <JournalCard article={editorial} index={index + 1} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
