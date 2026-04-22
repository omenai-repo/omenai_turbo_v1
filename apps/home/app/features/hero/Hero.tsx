"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import { MoveLeft, MoveRight } from "lucide-react";
import PromotionalCard from "@omenai/shared-ui-components/components/promotionals/PromotionalCard";

const TWEEN_FACTOR_BASE = 0.52;

export default function Hero({ promotionals }: any) {
  // ── 1. DATA ──────────────────────────────────────────────────────────
  const slides =
    promotionals.length < 5
      ? [...promotionals, ...promotionals, ...promotionals]
      : promotionals;

  // ── 2. EMBLA SETUP ───────────────────────────────────────────────────
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const slideNodes = useRef<HTMLElement[]>([]);
  const overlayNodes = useRef<HTMLElement[]>([]);

  // ── 3. TWEEN NODE REFS ───────────────────────────────────────────────
  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType) => {
    slideNodes.current = emblaApi
      .slideNodes()
      .map(
        (slideNode) => slideNode.querySelector(".slide_inner") as HTMLElement,
      );
    overlayNodes.current = emblaApi
      .slideNodes()
      .map(
        (slideNode) => slideNode.querySelector(".slide_overlay") as HTMLElement,
      );
  }, []);

  // ── 4. TWEEN SCALE/BLUR LOGIC ────────────────────────────────────────
  const tweenScale = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);
                if (sign === -1)
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                if (sign === 1)
                  diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR_BASE);

          // Scale: centre card = 1.0, flanking cards = 0.8
          const scale = Math.max(Math.min(tweenValue, 1), 0.8).toString();

          // Blur & mist
          const blurIntensity = (1 - Math.max(Math.min(tweenValue, 1), 0)) * 18;
          const blur = `blur(${Math.max(0, blurIntensity)}px)`;
          const overlayOpacity = (
            1 - Math.max(Math.min(tweenValue, 1), 0.5)
          ).toString();
          const zIndex = Math.round(tweenValue * 100).toString();

          const cardNode = slideNodes.current[slideIndex];
          if (cardNode) {
            cardNode.style.transform = `scale(${scale})`;
            cardNode.style.filter = blur;
            cardNode.style.zIndex = zIndex;
            cardNode.style.willChange = "transform, filter";
          }

          const overlayNode = overlayNodes.current[slideIndex];
          if (overlayNode) {
            overlayNode.style.opacity = overlayOpacity;
          }
        });
      });
    },
    [],
  );

  // ── 5. EFFECTS ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    setTweenNodes(emblaApi);
    setScrollSnaps(emblaApi.scrollSnapList());
    tweenScale(emblaApi);

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("reInit", setTweenNodes);
    emblaApi.on("reInit", tweenScale);
    emblaApi.on("scroll", () => tweenScale(emblaApi, "scroll"));

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("reInit", setTweenNodes);
      emblaApi.off("reInit", tweenScale);
      emblaApi.off("scroll", () => tweenScale(emblaApi, "scroll"));
    };
  }, [emblaApi, setTweenNodes, tweenScale]);

  const onSelect = (api: EmblaCarouselType) =>
    setSelectedIndex(api.selectedScrollSnap());

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  // ── 6. RENDER ────────────────────────────────────────────────────────
  return (
    <section className="relative w-full overflow-hidden">
      <div className="w-full" ref={emblaRef}>
        <div className="flex touch-pan-y py-0 md:py-4 items-center">
          {slides.map((promotional: any, index: number) => (
            <div
              key={`${promotional.id}-${index}`}
              className={[
                // ── MOBILE: 100% width, zero padding → true edge-to-edge ──
                // ── DESKTOP: 60% width, gap padding → peek/scale carousel ──
                "flex-[0_0_100%] md:flex-[0_0_60%]",
                "min-w-0",
                "px-0 md:px-4",
                "relative",
              ].join(" ")}
              style={{ perspective: "1000px" }}
            >
              <div
                className="slide_inner w-full h-full relative transition-shadow duration-300"
                style={{ transformOrigin: "center center" }}
              >
                {/*
                  Card wrapper:
                  • No border-radius on mobile → true flush/edge-to-edge
                  • rounded-lg on md+ → cards look lifted within the carousel peek
                */}
                <div className="rounded-sm overflow-hidden relative ">
                  <PromotionalCard {...promotional} />

                  {/*
                    White mist overlay (tween-driven opacity).
                    On mobile with 100% slides, the active card is always
                    tweenValue ≈ 1, so overlayOpacity ≈ 0 — essentially invisible.
                  */}
                  <div className="slide_overlay absolute inset-0 bg-[#F5EFE7] pointer-events-none z-50 transition-opacity duration-75" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP: Minimalist long-arrow navigation ── */}
      <div className="hidden md:flex justify-end items-center gap-8 px-6 lg:px-12 mt-2">
        <button
          onClick={scrollPrev}
          className="group flex items-center justify-center text-stone-700 transition-colors hover:text-stone-400"
          aria-label="Previous slide"
        >
          <MoveLeft
            size={18}
            strokeWidth={1}
            absoluteStrokeWidth
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
        </button>
        <button
          onClick={scrollNext}
          className="group flex items-center justify-center text-stone-700 transition-colors hover:text-stone-400"
          aria-label="Next slide"
        >
          <MoveRight
            size={18}
            strokeWidth={1}
            absoluteStrokeWidth
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>

      {/* ── MOBILE: Dot indicators (elongated active pill) ── */}
      <div className="flex md:hidden justify-center items-center gap-[6px] py-5">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={[
              "h-[3px] rounded-full transition-all duration-400",
              index === selectedIndex
                ? "w-7 bg-stone-700"
                : "w-[6px] bg-stone-300",
            ].join(" ")}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
