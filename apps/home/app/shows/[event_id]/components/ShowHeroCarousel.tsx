"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { getPromotionalOptimizedImage } from "@omenai/shared-lib/storage/getPromotionalsFileView";

export const ShowHeroCarousel = ({ show }: { show: any }) => {
  const hasInstallationViews =
    Array.isArray(show.installation_views) &&
    show.installation_views.length > 0;

  const images: string[] = hasInstallationViews
    ? show.installation_views
    : [show.cover_image];

  const isMulti = images.length > 1;

  // ── 2. State ──
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── 3. Embla setup — only active when multi-image ──
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    watchDrag: isMulti,
    duration: 32, // snappier slide transition (Embla units ~ms/4)
  });

  // ── 4. Scroll-based parallax (works everywhere — no bg-fixed) ──
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Parallax: image moves up at 35% of scroll speed, creating depth
  const parallaxY = scrollY * 0.35;

  // ── 5. Track selected slide ──
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // ── 6. Autoplay — pauses on hover ──
  const startAutoplay = useCallback(() => {
    if (!emblaApi || !isMulti) return;
    autoplayRef.current = setInterval(() => {
      if (!isHovered && emblaApi.canScrollNext()) emblaApi.scrollNext();
    }, 3500);
  }, [emblaApi, isMulti, isHovered]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  }, []);

  useEffect(() => {
    stopAutoplay();
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  // ── 7. Navigation ──
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  // ── 8. Entrance animation on mount ──
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  // ── 9. Format event type label ──
  const eventLabel = (show.event_type as string)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // ── Shared parallax bg renderer ──
  const ParallaxBg = ({
    src,
    active = true,
  }: {
    src: string;
    active?: boolean;
  }) => (
    <div
      aria-hidden
      className="absolute inset-x-0 w-full bg-cover bg-center will-change-transform"
      style={{
        backgroundImage: `url(${getPromotionalOptimizedImage(src, "xlarge")})`,
        top: "-18%",
        height: "136%",
        transform: active ? `translateY(${parallaxY}px)` : undefined,
        backfaceVisibility: "hidden",
      }}
    />
  );

  return (
    <>
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-text-in {
          animation: heroFadeUp 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .hero-text-in-2 { animation-delay: 100ms; }
        .hero-text-in-3 { animation-delay: 200ms; }

        /* Arrow button */
        .iv-arrow {
          transition: opacity 160ms ease, background 160ms ease;
          opacity: 0;
        }
        .iv-hero:hover .iv-arrow { opacity: 1; }

        /* Progress bar animation */
        @keyframes progressBar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .iv-progress-bar {
          transform-origin: left;
          animation: progressBar 5.5s linear both;
        }
      `}</style>

      <section
        className="iv-hero relative w-full overflow-hidden bg-[#0d0d0d]"
        style={{ height: "clamp(420px, 72vh, 760px)" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ═══ SINGLE IMAGE — Static parallax ═══ */}
        {!isMulti && (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <ParallaxBg src={images[0]} />
          </div>
        )}

        {/* ═══ MULTI IMAGE — Embla carousel with per-slide parallax ═══ */}
        {isMulti && (
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            ref={emblaRef}
          >
            <div className="flex w-full h-full">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] min-w-0 relative h-full overflow-hidden"
                >
                  {/* Only the active slide gets scroll parallax; others stay frozen */}
                  <ParallaxBg src={img} active={idx === selectedIndex} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Gradient overlays ═══ */}
        {/* Bottom-up dark ramp — for text legibility */}
        <div
          aria-hidden
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.28) 42%, rgba(0,0,0,0.08) 70%, transparent 100%)",
          }}
        />
        {/* Subtle left edge vignette */}
        <div
          aria-hidden
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.25) 0%, transparent 50%)",
          }}
        />

        {/* ═══ Top-left: event type badge ═══ */}
        <div
          className={`absolute top-7 left-7 z-30 ${isLoaded ? "hero-text-in" : "opacity-0"}`}
        >
          <span className="inline-flex items-center gap-2 bg-white/[0.12] backdrop-blur-sm border border-white/[0.18] px-3.5 py-1.5">
            <span className="w-1 h-1 rounded-full bg-white/60" aria-hidden />
            <span
              className="text-white/80 font-medium"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "9px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
              }}
            >
              {eventLabel}
            </span>
          </span>
        </div>

        {/* ═══ Top-right: image counter (multi only) ═══ */}
        {isMulti && (
          <div
            className="absolute top-7 right-7 z-30"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            <span
              className="text-white/40"
              style={{ fontSize: "11px", letterSpacing: "0.12em" }}
            >
              <span className="text-white/85">
                {String(selectedIndex + 1).padStart(2, "0")}
              </span>
              <span className="mx-1.5 text-white/25">/</span>
              {String(images.length).padStart(2, "0")}
            </span>
          </div>
        )}

        {/* ═══ Prev / Next arrows (multi only) ═══ */}
        {isMulti && (
          <>
            <button
              onClick={scrollPrev}
              aria-label="Previous installation view"
              className="iv-arrow absolute left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-200"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M9 2L4 7L9 12"
                  stroke="white"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next installation view"
              className="iv-arrow absolute right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/60 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-200"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 2L10 7L5 12"
                  stroke="white"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {/* ═══ Bottom bar: Installation view label + dot nav ═══ */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex items-end justify-between px-7 pb-7">
          {/* "Installation View" caption — Artsy-style */}
          <p
            className={`text-white/40 ${isLoaded ? "hero-text-in hero-text-in-2" : "opacity-0"}`}
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "10px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            {hasInstallationViews ? "Installation View" : "Exhibition Cover"}
            {isMulti && (
              <span className="ml-2 text-white/20">
                — {images.length} Images
              </span>
            )}
          </p>

          {/* Dot / progress indicators */}
          {isMulti && (
            <div
              className={`flex items-center gap-2 ${isLoaded ? "hero-text-in hero-text-in-3" : "opacity-0"}`}
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(i)}
                  aria-label={`Go to view ${i + 1}`}
                  className="relative flex items-center"
                >
                  {i === selectedIndex ? (
                    // Active: animated progress bar
                    <span
                      className="relative block overflow-hidden bg-white/20"
                      style={{ width: "28px", height: "2px" }}
                    >
                      <span
                        key={selectedIndex} // remount on slide change to restart animation
                        className="iv-progress-bar absolute inset-0 bg-white"
                        style={{
                          animationPlayState: isHovered ? "paused" : "running",
                        }}
                      />
                    </span>
                  ) : (
                    // Inactive: static dash
                    <span
                      className="block bg-white/30 hover:bg-white/60 transition-colors duration-200"
                      style={{ width: "10px", height: "2px" }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
