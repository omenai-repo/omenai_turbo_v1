"use client";

import React, { useState, useRef, useEffect } from "react";
import { ShowArtworksGrid } from "./components/ShowArtworksGrid";
import { ShowExhibitionInfo } from "./components/ShowExhibitionInfo";
import { ShowHeroCarousel } from "./components/ShowHeroCarousel";
import { ShowImmersiveCarousel } from "./components/ShowImmersiveCarousel";

export const ShowDetailsClient = ({ show }: { show: any }) => {
  return (
    <>
      <style>{`
        @keyframes artFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .art-item {
          animation: artFadeIn 300ms ease both;
        }
        @keyframes immersiveReveal {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .immersive-section {
          animation: immersiveReveal 280ms ease both;
        }
      `}</style>

      <main className="min-h-screen w-full bg-white font-sans">
        {/* 1. Hero parallax carousel */}
        <ShowHeroCarousel show={show} />

        {/* 3. Exhibition info + curatorial statement */}
        <ShowExhibitionInfo event={show} />

        {/* 4. Artworks grid with filters */}
        <ShowArtworksGrid show={show} />
      </main>
    </>
  );
};
