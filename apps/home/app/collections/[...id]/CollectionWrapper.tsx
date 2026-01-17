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
const getHistory = (medium: string) => {
  // @ts-ignore - Dynamic access
  return artMediumHistory[medium] || "A curated selection of works.";
};

export default function CollectionWrapper({ id }: { id: string }) {
  const { user } = useAuth({ requiredRole: "user" });

  const pageTitleParser = (): ArtworkMediumTypes | null => {
    const decodedMedium = decodeMediumFromUrl(id);
    if (!decodedMedium) return null;
    return decodedMedium;
  };

  const page_title = pageTitleParser() as ArtworkMediumTypes;

  if (!page_title) return null; // Or a 404 component

  return (
    <div className="min-h-screen bg-white">
      <DesktopNavbar />

      <main className="container mx-auto px-6 lg:px-12 pt-8 pb-24">
        {/* 1. CURATORIAL STATEMENT (Header) */}
        <header className="mb-12 md:mb-20 lg:mb-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 border-b border-black pb-8 md:pb-12">
          {/* Title Block */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="mb-4 md:mb-6 flex items-center gap-3 font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-neutral-500">
              <Link
                href="/collections"
                className="hover:text-dark hover:underline decoration-1 underline-offset-4"
              >
                Collections
              </Link>
              <span>/</span>
              <span className="text-dark">Current View</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl italic text-dark leading-[0.9] tracking-tight break-words hyphens-auto">
              {page_title}
            </h1>
          </div>

          {/* History / Text Block */}
          <div className="lg:col-span-5 flex flex-col justify-end pt-4 lg:pt-0">
            <div className="prose prose-sm md:prose-base max-w-none">
              <p className="font-serif text-base md:text-lg leading-relaxed text-neutral-700">
                {getHistory(page_title)}
              </p>
            </div>

            {/* Decorative Line - Hidden on mobile if desired, or kept for structure */}
            <div className="mt-6 md:mt-8 h-[1px] w-full bg-neutral-200" />
          </div>
        </header>

        {/* 2. THE GALLERY (Grid) */}
        <div className="w-full">
          {/* NOTE: If you have a Filter component, it would ideally live 
               in a sticky sidebar to the left (col-span-3) and the listing 
               to the right (col-span-9). 
               For now, we present the full width gallery.
            */}
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
