"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import PromotionalCard from "@omenai/shared-ui-components/components/promotionals/PromotionalCard";
import { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import { HiArrowLongLeft, HiArrowLongRight } from "react-icons/hi2";
import { MoveLeft, MoveRight } from "lucide-react";

const TWEEN_FACTOR_BASE = 0.5;

export default function Hero({ promotionals }: any) {
  // 1. DATA PREP
  const slides =
    promotionals.length < 5
      ? [...promotionals, ...promotionals, ...promotionals]
      : promotionals;

  // 2. EMBLA SETUP
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

  // 3. REF SELECTION
  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType) => {
    slideNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".slide_inner") as HTMLElement;
    });
    overlayNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector(".slide_overlay") as HTMLElement;
    });
  }, []);

  // 4. TWEEN LOGIC
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

          // SCALE: Center = 1.0, Sides = 0.75
          const scale = Math.max(Math.min(tweenValue, 1), 0.75).toString();

          // BLUR & MIST
          const blurIntensity = (1 - Math.max(Math.min(tweenValue, 1), 0)) * 20;
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

  const onSelect = (api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  };

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="w-full" ref={emblaRef}>
        {/* CHANGED: items-center ensures the flex container centers items vertically */}
        <div className="flex touch-pan-y py-4 items-center">
          {slides.map((promotional: any, index: number) => (
            <div
              key={`${promotional.id}-${index}`}
              className="flex-[0_0_85%] md:flex-[0_0_60%] min-w-0 px-2 md:px-4 relative"
              style={{ perspective: "1000px" }}
            >
              <div
                className="slide_inner w-full h-full relative transition-shadow duration-300"
                // CHANGED: transformOrigin is now 'center center' to shrink towards the middle
                style={{ transformOrigin: "center center" }}
              >
                <div className="rounded-lg shadow-2xl shadow-dark/5 bg-dark overflow-hidden relative">
                  <PromotionalCard {...promotional} />

                  {/* WHITE MIST OVERLAY */}
                  <div className="slide_overlay absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. DESKTOP CONTROLS (Minimalist Long Arrows) */}
      <div className="hidden md:flex justify-end items-center gap-8 px-6 lg:px-12">
        <button
          onClick={scrollPrev}
          className="group flex items-center justify-center text-dark transition-colors hover:text-neutral-500"
          aria-label="Previous Slide"
        >
          <MoveLeft
            size={20}
            strokeWidth={1}
            absoluteStrokeWidth
            className="text-3xl transition-transform duration-300 group-hover:-translate-x-1"
          />{" "}
        </button>

        <button
          onClick={scrollNext}
          className="group flex items-center justify-center text-dark transition-colors hover:text-neutral-500"
          aria-label="Next Slide"
        >
          <MoveRight
            size={20}
            strokeWidth={1}
            absoluteStrokeWidth
            className="text-3xl transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>

      <div className="flex md:hidden justify-center gap-2 mb-8 px-6">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "w-8 bg-dark" : "w-1.5 bg-neutral-200"
            }`}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
          />
        ))}
      </div>
    </section>
  );
}
