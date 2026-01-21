"use client";

import { ArtworksListing } from "./components/ArtworksListing";
import Link from "next/link";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { artMediumHistory } from "./artMediumBriefHistory";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { decodeMediumFromUrl } from "@omenai/shared-utils/src/decodeMediumForUrl";
import { ArtworkMediumTypes } from "@omenai/shared-types";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";

// Helper to safely get the history text
const getHistory = (medium: ArtworkMediumTypes) => {
  return (
    artMediumHistory[medium] ||
    "Explore a curated selection of works in this medium."
  );
};

export default function CollectionWrapper({ id }: { id: string }) {
  const { user } = useAuth({ requiredRole: "user" });

  const pageTitleParser = (): ArtworkMediumTypes | null => {
    const decodedMedium = decodeMediumFromUrl(id);
    if (!decodedMedium) return null;
    return decodedMedium;
  };

  const page_title = pageTitleParser() as ArtworkMediumTypes;

  if (!page_title) return null;

  return (
    <div className="min-h-screen bg-white">
      <DesktopNavbar />

      {/* Added pt-28 to clear fixed navbar */}
      <main className="container mx-auto px-6 lg:px-12 pt-28 pb-24">
        {/* 1. COLLECTION HEADER */}
        <header className="mb-12 border-b border-neutral-100 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            {/* Title Block */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-neutral-400">
                <Link
                  href="/collections"
                  className="hover:text-dark  transition-colors"
                >
                  Collections
                </Link>
                <span>/</span>
                <span className="text-dark ">{page_title}</span>
              </div>

              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-dark  leading-none tracking-tight">
                {page_title}
              </h1>
            </div>

            {/* Description Block */}
            <div className="lg:col-span-5">
              <p className="font-sans text-sm md:text-base leading-relaxed text-neutral-500 max-w-xl">
                {getHistory(page_title)}
              </p>
            </div>
          </div>
        </header>

        {/* 2. THE GALLERY (Grid) */}
        <div className="w-full min-h-[50vh]">
          <ArtworksListing
            medium={page_title}
            sessionId={user ? user.id : undefined}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
